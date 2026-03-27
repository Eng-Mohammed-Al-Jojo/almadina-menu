import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
    options: { id: string; name: string }[];
    value: string;
    onChange: (val: string) => void;
    error?: boolean;
    placeholder?: string;
    disabled?: boolean;
}

const CustomSelect: React.FC<Props> = ({ options, value, onChange, error, placeholder, disabled }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);

    return (
        <div className="relative w-full" ref={ref} dir="rtl">
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`
                    w-full flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-300
                    bg-(--bg-main) backdrop-blur-md outline-none
                    ${disabled ? "opacity-50 cursor-not-allowed border-(--border-color)" : ""}
                    ${error ? "border-red-500 ring-4 ring-red-500/5" : (!disabled ? "border-(--border-color) focus:border-primary focus:ring-4 focus:ring-primary/5" : "")} 
                `}
            >
                <span className={`text-sm font-bold ${selectedOption ? "text-(--text-main)" : "text-(--text-muted)/50"}`}>
                    {selectedOption ? selectedOption.name : placeholder || t('common.select')}
                </span>
                <FiChevronDown className={`transition-transform duration-300 text-(--text-muted) ${open ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute z-60 w-full right-0 mt-3 max-h-64 overflow-hidden rounded-2xl bg-(--bg-card)/95 backdrop-blur-2xl border border-(--border-color) shadow-2xl"
                    >
                        <div className="overflow-y-auto max-h-64 custom-scrollbar p-2">
                            {options.length === 0 ? (
                                <div className="p-4 text-center text-xs text-(--text-muted) font-bold">{t('common.no_options')}</div>
                            ) : (
                                options.map(o => (
                                    <button
                                        key={o.id}
                                        type="button"
                                        onClick={() => { onChange(o.id); setOpen(false); }}
                                        className={`
                                            w-full text-right px-4 py-3 rounded-xl transition-all flex items-center justify-between group
                                            ${value === o.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/5 text-(--text-main)"}
                                        `}
                                    >
                                        <span className="text-sm font-bold">{o.name}</span>
                                        {value === o.id && <FiCheck className="text-white" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
