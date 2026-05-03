import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAssistantIntake } from "../context/AssistantIntakeContext";
import { isOpenBeforeIntakeComplete } from "../lib/navGate";

type Props = {
  to: string;
  className: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

/** Ссылка на закрытые до анкеты разделы превращается в неактивный текст с подсказкой. */
export function NavGateLink({ to, className, children, ariaLabel }: Props) {
  const { t } = useTranslation();
  const { hydrated, intakeDone } = useAssistantIntake();
  const allow = hydrated && (intakeDone || isOpenBeforeIntakeComplete(to));

  if (!allow) {
    return (
      <span
        className={`${className} cursor-not-allowed opacity-45`}
        title={hydrated ? t("intake.finishFirst") : undefined}
        aria-label={ariaLabel}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <Link to={to} className={className} aria-label={ariaLabel} title={ariaLabel}>
      {children}
    </Link>
  );
}
