interface ButtonProps {
    text: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary";
}

const Button = ({
    text,
    onClick,
    type = "button",
    variant = "primary",
}: ButtonProps) => {
    return (
        <button
            className={`button ${variant === "secondary" ? "button--secondary" : ""}`}
            onClick={onClick}
            type={type}
        >
            {text}
        </button>
    );
};

export default Button;
