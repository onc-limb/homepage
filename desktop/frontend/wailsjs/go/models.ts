export namespace article {
	
	export class Article {
	    id: string;
	    category: string;
	    title: string;
	    content: string;
	    featurePoint: number;
	    // Go type: time
	    publishedAt: any;
	    // Go type: time
	    editedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Article(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.category = source["category"];
	        this.title = source["title"];
	        this.content = source["content"];
	        this.featurePoint = source["featurePoint"];
	        this.publishedAt = this.convertValues(source["publishedAt"], null);
	        this.editedAt = this.convertValues(source["editedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

