'use client';

import React, { Component } from 'react';
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Transliteration Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

const StandardInput = ({ value, onChangeText, placeholder, className, ...props }) => (
    <div className="relative">
        <input
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={placeholder}
            className={className}
            {...props}
        />
        <div className="absolute right-3 top-3 text-orange-400 opacity-50" title="Transliteration unavailable (Offline/Error)">
            <AlertCircle size={16} />
        </div>
    </div>
);

export default function SafeTransliterate({ value, onChangeText, placeholder, className, containerClassName, ...props }) {
    return (
        <ErrorBoundary fallback={
            <StandardInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                className={className}
                {...props}
            />
        }>
            <ReactTransliterate
                renderComponent={(props) => <input {...props} />}
                value={value}
                onChangeText={onChangeText}
                lang="ta"
                placeholder={placeholder}
                className={className}
                containerClassName={containerClassName}
                {...props}
            />
        </ErrorBoundary>
    );
}
