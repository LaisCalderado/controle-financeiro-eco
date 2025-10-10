import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string; // permite passar classes extras
}

const Card = ({ children, className }: CardProps) => {
    return <div className={`card ${className || ""}`}>{children}</div>;
};

export default Card;
