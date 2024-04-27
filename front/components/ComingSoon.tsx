import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

const ComingSoon = (props: Props) => {
    return <div className="glow">{props.children} Coming Soon ...</div>;
};
export default ComingSoon;
