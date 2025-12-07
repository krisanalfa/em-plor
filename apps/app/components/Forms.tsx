import { Field, Input, Label, Select, Description } from "@headlessui/react";
import { Controller, Control, FieldError, FieldPath } from "react-hook-form";
import classNames from "classnames";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface BaseInputProps<T extends Record<string, unknown>> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  error?: FieldError;
  disabled?: boolean;
  className?: string;
}

interface TextInputProps<
  T extends Record<string, unknown>,
> extends BaseInputProps<T> {
  type?: "text" | "email" | "date" | "number";
  placeholder?: string;
  autoComplete?: string;
}

interface SelectInputProps<
  T extends Record<string, unknown>,
> extends BaseInputProps<T> {
  options: Array<{ id: string; name: string }>;
  placeholder?: string;
}

export function TextInput<T extends Record<string, unknown>>({
  name,
  control,
  label,
  required = false,
  error,
  disabled = false,
  className = "col-span-full",
  type = "text",
  placeholder,
  autoComplete,
}: TextInputProps<T>) {
  return (
    <Field className={className}>
      <Label className="block text-sm/6 font-medium text-gray-900">
        {label} {required && <span className="text-red-600">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value as string}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={classNames(
              "mt-2 block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm/6",
              {
                "outline-gray-300 focus:outline-cyan-600": !error,
                "outline-red-500 focus:outline-red-600": error,
              },
            )}
            disabled={disabled}
          />
        )}
      />
      {error && (
        <Description className="mt-1 text-sm text-red-600">
          {error.message}
        </Description>
      )}
    </Field>
  );
}

export function SelectInput<T extends Record<string, unknown>>({
  name,
  control,
  label,
  required = false,
  error,
  disabled = false,
  className = "sm:col-span-3",
  options,
  placeholder = "Select an option",
}: SelectInputProps<T>) {
  return (
    <Field className={className}>
      <Label className="block text-sm/6 font-medium text-gray-900">
        {label} {required && <span className="text-red-600">*</span>}
      </Label>
      <div className="relative mt-2">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              value={field.value as string}
              className={classNames(
                "block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm/6",
                {
                  "outline-gray-300 focus:outline-cyan-600": !error,
                  "outline-red-500 focus:outline-red-600": error,
                },
              )}
              disabled={disabled}
            >
              <option value="">{placeholder}</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          )}
        />
        {!disabled && (
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-2.5 right-2 size-5 text-gray-500 sm:size-4"
          />
        )}
      </div>
      {error && (
        <Description className="mt-1 text-sm text-red-600">
          {error.message}
        </Description>
      )}
    </Field>
  );
}
