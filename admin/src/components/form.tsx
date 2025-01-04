import { render } from 'hono/jsx/dom';

type FormData = {
  category: string;
  title: string;
  content: string;
};

const FormComponent = () => {
  let formData: FormData = { category: '', title: '', content: ''};
  const categories = [{id: 1, name: "engineer"}, {id: 2, name: "climbing"}]
  const validateField = (name: keyof FormData, value: string) => {
    const errorElement = document.getElementById(`${name}-error`);
    if (!errorElement) return;

    let errorMessage = '';

    // 各フィールドのバリデーションルール
    switch (name) {
      case 'category':
        if (value === '') {
          errorMessage = 'カテゴリーを選択してください。';
        }
        break;
        
      case 'title':
        if (value.length < 3) {
          errorMessage = 'タイトルは3文字以上入力してください。';
        } else if (value.length > 20) {
          errorMessage = 'タイトルは20文字以内で入力してください。';
        }
        break;

      case 'content':
        if (value.length < 10) {
          errorMessage = '本文は10文字以上入力してください。';
        } else if (value.length > 500) {
          errorMessage = '本文は500文字以内で入力してください。';
        }
        break;
    }

    // エラーがあれば表示、なければ非表示
    errorElement.textContent = errorMessage;
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    formData = { ...formData, [name]: value };
    validateField(name as keyof FormData, value);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const errorMessages = document.querySelectorAll('.error-message');
    const hasError = Array.from(errorMessages).some((error) => error.textContent !== '');
    if (hasError) {
      alert('すべての入力項目を正しく入力してください。');
      return;
    }
    alert('送信が成功しました！');
    console.log('送信データ:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>記事の新規投稿</h2>

      {/* カテゴリー */}
      <div>
      <label htmlFor="category">カテゴリー</label>
      <select id="category" name="category" required>
              <option value="">選択してください</option>
              {categories.map((category, index) => (
              <option key={index} value={category.id}>{category.name}</option>
              ))}
            </select>
      <small id="category-error" class="error-message"></small>
      </div>

      {/* タイトル */}
      <div>
      <label htmlFor="title">タイトル</label>
      <input 
        type="text" 
        id="title" 
        name="title" 
        onInput={handleInput} 
        placeholder="3〜20文字のタイトルを入力してください" 
      />
      <small id="title-error" class="error-message"></small>
      </div>

      {/* 本文 */}
      <div>
      <label htmlFor="content">本文</label>
      <textarea 
        id="content" 
        name="content" 
        onInput={handleInput} 
        placeholder="10〜500文字の本文を入力してください"
      ></textarea>
      <small id="content-error" class="error-message"></small>
      </div>

      <button type="submit">送信</button>
    </form>
  );
};

export default FormComponent
