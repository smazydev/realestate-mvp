"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  /** When provided, overrides useFormStatus (e.g. when form uses onSubmit + server action instead of form action). */
  pending?: boolean;
};

/** Submit button that shows pending state. Must be rendered inside the form. Uses pending prop or useFormStatus. */
export function SubmitButton({ children, pendingLabel = "Saving…", className, disabled, pending: pendingProp }: Props) {
  const { pending: statusPending } = useFormStatus();
  const pending = pendingProp ?? statusPending;
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={className}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
