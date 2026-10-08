/* =========================================
   STUDYAI - LOGIN JAVASCRIPT
   Supabase Authentication
========================================= */


/* =========================================
   SUPABASE CONFIGURATION
========================================= */

/*
    Replace these with your actual
    Supabase Project URL and Publishable/Anon Key.
*/

const SUPABASE_URL = "https://lauhltxwzasfjjksbihx.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_2PTLzATKATqz4hoB--4j3w_WCJwKKm2";


/*
    Create Supabase client
*/

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);



/* =========================================
   GET HTML ELEMENTS
========================================= */

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const errorMessage =
    document.getElementById("errorMessage");

const forgotPassword =
    document.getElementById("forgotPassword");



/* =========================================
   PASSWORD SHOW / HIDE
========================================= */

togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        /* Show password */

        passwordInput.type = "text";

        togglePassword.textContent = "🙈";

        togglePassword.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        /* Hide password */

        passwordInput.type = "password";

        togglePassword.textContent = "👁";

        togglePassword.setAttribute(
            "aria-label",
            "Show password"
        );

    }

});



/* =========================================
   LOGIN FORM SUBMISSION
========================================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        /*
            Prevent normal form submission.
        */

        event.preventDefault();


        /* =====================================
           GET INPUT VALUES
        ===================================== */

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        /*
            Clear previous error
        */

        errorMessage.textContent = "";


        /* =====================================
           EMAIL EMPTY VALIDATION
        ===================================== */

        if (email === "") {

            errorMessage.textContent =
                "Please enter your Gmail address.";

            emailInput.focus();

            return;
        }


        /* =====================================
           GMAIL FORMAT VALIDATION
        ===================================== */

        const gmailPattern =
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


        if (!gmailPattern.test(email)) {

            errorMessage.textContent =
                "Please enter a valid Gmail address.";

            emailInput.focus();

            return;
        }


        /* =====================================
           PASSWORD EMPTY VALIDATION
        ===================================== */

        if (password === "") {

            errorMessage.textContent =
                "Please enter your password.";

            passwordInput.focus();

            return;
        }


        /* =====================================
           PASSWORD LENGTH VALIDATION
        ===================================== */

        if (password.length < 8) {

            errorMessage.textContent =
                "Password must contain at least 8 characters.";

            passwordInput.focus();

            return;
        }



        /* =====================================
           DISABLE LOGIN BUTTON
        ===================================== */

        const loginButton =
            loginForm.querySelector(".login-button");


        const originalButtonText =
            loginButton.innerHTML;


        loginButton.disabled = true;

        loginButton.innerHTML =
            `<span>Signing in...</span>`;



        /* =====================================
           SUPABASE LOGIN
        ===================================== */

        try {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: password

                });



            /* =================================
               CHECK LOGIN ERROR
            ================================= */

            if (error) {

                console.error(
                    "Supabase Login Error:",
                    error
                );


                /*
                    Restore button
                */

                loginButton.disabled = false;

                loginButton.innerHTML =
                    originalButtonText;


                /*
                    Show user-friendly error
                */

                if (
                    error.message
                        .toLowerCase()
                        .includes("invalid login credentials")
                ) {

                    errorMessage.textContent =
                        "Invalid email or password.";

                } else if (
                    error.message
                        .toLowerCase()
                        .includes("email not confirmed")
                ) {

                    errorMessage.textContent =
                        "Please verify your email before signing in.";

                } else {

                    errorMessage.textContent =
                        error.message;

                }

                return;
            }



            /* =================================
               LOGIN SUCCESSFUL
            ================================= */

            console.log(
                "Login successful!"
            );


            console.log(
                "Logged in user:",
                data.user
            );


            console.log(
                "Session:",
                data.session
            );



            /* =================================
               REDIRECT TO DASHBOARD
            ================================= */

            window.location.href =
                "../dashboard.html";

        }

        catch (error) {

            console.error(
                "Unexpected Login Error:",
                error
            );


            /*
                Restore button
            */

            loginButton.disabled = false;

            loginButton.innerHTML =
                originalButtonText;


            errorMessage.textContent =
                "Something went wrong. Please try again.";

        }

    }
);



/* =========================================
   FORGOT PASSWORD
========================================= */

forgotPassword.addEventListener(
    "click",
    async function (event) {

        event.preventDefault();


        /*
            Get email
        */

        const email =
            emailInput.value.trim();


        /* =====================================
           EMAIL EMPTY
        ===================================== */

        if (email === "") {

            errorMessage.textContent =
                "Please enter your Gmail address first.";

            emailInput.focus();

            return;
        }


        /* =====================================
           GMAIL VALIDATION
        ===================================== */

        const gmailPattern =
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


        if (!gmailPattern.test(email)) {

            errorMessage.textContent =
                "Please enter a valid Gmail address.";

            emailInput.focus();

            return;
        }


        /* Clear previous error */

        errorMessage.textContent = "";


        /* =====================================
           SEND PASSWORD RESET EMAIL
        ===================================== */

        try {

            const { error } =
                await supabaseClient.auth
                    .resetPasswordForEmail(
                        email,
                        {
                            redirectTo:
                                `${window.location.origin}/reset-password.html`
                        }
                    );


            /* =================================
               RESET ERROR
            ================================= */

            if (error) {

                console.error(
                    "Password Reset Error:",
                    error
                );


                errorMessage.textContent =
                    error.message;

                return;
            }


            /* =================================
               RESET EMAIL SENT
            ================================= */

            alert(
                "Password reset link has been sent to your Gmail."
            );

        }

        catch (error) {

            console.error(
                "Unexpected Password Reset Error:",
                error
            );


            errorMessage.textContent =
                "Unable to send password reset email.";

        }

    }
);



/* =========================================
   CHECK EXISTING SESSION
========================================= */

/*
    If the user is already logged in and
    opens login.html again, send them
    directly to the dashboard.
*/

async function checkExistingSession() {

    try {

        const {
            data: { session },
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session Check Error:",
                error
            );

            return;
        }


        /*
            If session already exists
        */

        if (session) {

            console.log(
                "Existing session found."
            );


            window.location.href =
                "dashboard.html";

        }

    }

    catch (error) {

        console.error(
            "Unexpected Session Error:",
            error
        );

    }

}


/*
    Run session check
*/

checkExistingSession();
