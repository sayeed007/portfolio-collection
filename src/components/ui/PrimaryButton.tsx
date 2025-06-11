import React from "react";
import { Button, ButtonProps } from "./button";

interface PrimaryButtonProps extends ButtonProps {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const PrimaryButton = ({ children, className, onClick, ...props }: PrimaryButtonProps) => {
    return (
        <Button
            size="lg"
            className={`cursor-pointer h-12 px-8 text-sm bg-gradient-to-r from-blue-600 to-purple-600 
                  hover:from-blue-700 hover:to-purple-700 text-white shadow-lg 
                  hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className || ""}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </Button>
    );
};

export default PrimaryButton;
