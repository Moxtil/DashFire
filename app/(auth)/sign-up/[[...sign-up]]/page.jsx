import React from "react";
import { SignUp } from "@clerk/nextjs";
export default function page() {
  return (
    <div className="authForms sign-up-form">
      <SignUp forceRedirectUrl="/" />
    </div>
  );
}
