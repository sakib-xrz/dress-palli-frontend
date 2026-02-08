import { FieldError } from "react-hook-form";

export function FormErrorMessage({ error }: { error: FieldError | undefined }) {
  return (
    error?.message && (
      <div className="text-xs font-normal text-destructive">
        {error.message}
      </div>
    )
  );
}
