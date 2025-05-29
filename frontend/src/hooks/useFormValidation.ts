import { useState } from "react";

export type ValidationRules<T> = {
    [K in keyof T]?: (value: string, context?: T) => string | undefined;
}


export function useFormValidation<T extends Record<keyof T, string>>(
    initialValues: T,
    rules: ValidationRules<T>
) {
    const [values, setValues] = useState<T>(initialValues);
    // const [errors, setErrors] = useState<Record<keyof T, string>>({} as any);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

    const handleChange = (field: keyof T, value:string)=> {
        setValues((prev) => ({...prev, [field]: value}));
        validateField(field, value);
    };
        
    const validateField = (field: keyof T, value: string, 
      overrideRule?: (value: string, context?: T) => string | undefined) => {
      const rule = overrideRule ?? rules[field];
      const error = rule ? rule(value, values) : undefined;
      setErrors((prev) => ({ ...prev, [field]: error || "" }));
    };
    
    const validateAll = (): boolean => {
        const newErrors: Partial<Record<keyof T, string>> = {};
        let valid = true;
    
        for (const field in rules) {
          const rule = rules[field];
          const value = values[field];
          const error = rule?.(value, values);
          if (error) {
            newErrors[field] = error;
            valid = false;
          }
        }
    
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return valid;
      };
    
      const reset = () => {
        setValues(initialValues);
        setErrors({} as any);
      };
    
      return {
        values,
        errors,
        setValues,
        handleChange,
        validateField,
        validateAll,
        reset,
      };
}