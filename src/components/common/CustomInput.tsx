import styles from "./CustomInput.module.css";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

function CustomInput({ className = "", ...props }: CustomInputProps) {
  return <input className={`${styles.input} ${className}`} {...props} />;
}

export default CustomInput;
