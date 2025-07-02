import React from "react";
import { SignIn } from "@clerk/nextjs";
export default function page() {
  return (
    <div className="authForms sign-in-form">
      <SignIn forceRedirectUrl="/" />
    </div>
  );
}
