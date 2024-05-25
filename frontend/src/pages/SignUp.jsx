import NavbarController from "../components/Navbar/NavbarController";
import SignUpForm from "../components/Forms/SignUpForm";
import SignUpFormPatient from "../components/Forms/SignUpFormPatient";

function SignUp({ role, resetLink, signupLink }) {
  return (
    <>
      <NavbarController type={0} page="Sign In" color="blue" />
      <div className="grid items-center justify-center w-full min-h-screen grid-cols-4 px-20 pt-12 mx-auto min-w-screen">
        {role === "patient" ? (
          <SignUpFormPatient role={role} resetLink={resetLink} signupLink={signupLink} />
        ) : (
          <SignUpForm role={role} resetLink={resetLink} signupLink={signupLink} />
        )}
      </div>
    </>
  );
}

export default SignUp;
