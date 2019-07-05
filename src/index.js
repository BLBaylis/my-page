require("dotenv").config();
require("normalize.css/normalize.css");
require("./styles/index.scss");

import "regenerator-runtime/runtime.js";
import $ from "jquery";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/alert";

$(() => {
    const homeVideo = $(".home-video");
    const contactForm = $(".contact-form");
    positionHomeVideo("DOMContentLoaded");
    homeVideo.on("play", () => {
        $(".navbar").removeClass("navbar--initial");
        $(".side-bar").removeClass("side-bar--initial");
    });
    $.easing.easeInOutExpo = function(x, t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
        return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
    };
    $(".nav-link").on("click", event => {
        animateScroll(event);
        collapseMobileNavbar(event);
    });
    $(".scroll-link").on("click", animateScroll);
    contactForm.on("submit", handleFormSubmit);
    contactForm.on("animationend", () => {
        contactForm.toggleClass("initial-animation-done initial-animation");
        $("footer").toggleClass(
            "initial-animation-done initial-animation-footer"
        );
    });
});

const positionHomeVideo = eventType => {
    const video = $(".home-video");
    const homeVideoWrapperInner = $(".home-video-wrapper-inner");
    const sideBit = $(".side-bit");
    const eventHandler = () => {
        const aspectRatio = $(window).width() / $(window).height();
        const height = document.querySelector(".home-video").offsetHeight;
        const width = 1.77 * height;
        const right = -0.39 * width;
        if (aspectRatio < 1.0875) {
            homeVideoWrapperInner.css("right", right);
        } else if (aspectRatio <= 1.775) {
            homeVideoWrapperInner.css("right", "initial");
        }
    };
    if (eventType === "resize") {
        eventHandler();
    }
    if (eventType === "DOMContentLoaded") {
        window.addEventListener("load", eventHandler);
        window.addEventListener("resize", eventHandler);
    }
};

const animateScroll = event => {
    const eventTarget = event.target;
    if (
        location.pathname.replace(/^\//, "") ==
            eventTarget.pathname.replace(/^\//, "") &&
        location.hostname == eventTarget.hostname
    ) {
        let linkTarget = $(eventTarget.hash);
        linkTarget = linkTarget.length
            ? linkTarget
            : $("[name=" + linkTarget.slice(1) + "]");
        if (linkTarget.length) {
            $("html, body").animate(
                {
                    scrollTop: linkTarget.offset().top
                },
                1000,
                "easeInOutExpo"
            );
        }
    }
};

const collapseMobileNavbar = event => {
    const navbarCollapse = $(".navbar-collapse");
    if (navbarCollapse.hasClass("show")) {
        navbarCollapse.collapse("hide");
    }
};

const handleFormSubmit = async event => {
    event.preventDefault();
    let errCaught = false;
    let res = false;
    let outcome;
    const alert = $(".alert");
    const contactForm = $(".contact-form");
    const toggleLoaderAnimation = () =>
        $(".lds-ring").toggleClass("animation-running");
    const toggleAlertAnimation = () => alert.toggleClass("alert-change");
    toggleLoaderAnimation();
    try {
        res = await sendForm(event);
    } catch (err) {
        errCaught = true;
    }
    if (!errCaught) {
        outcome = await res.json();
    }
    toggleLoaderAnimation();
    const wasEmailSuccessful = !errCaught && res.ok && outcome === "success";
    if (!contactForm.hasClass("initial-animation-done")) {
        editAlert(wasEmailSuccessful);
        contactForm.addClass("initial-animation");
        $("footer").addClass("initial-animation-footer");
    } else {
        alert.on("transitionend", () => {
            editAlert(wasEmailSuccessful);
            toggleAlertAnimation();
            alert.off("transitionend");
        });
        toggleAlertAnimation();
    }
};

const sendForm = async event => {
    const name = $("#name").val();
    const email = $("#email").val();
    const message = $("#message").val();
    console.log(process.env.API_LINK);
    return await fetch(`${process.env.API_LINK}/contact`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
    });
};

const editAlert = wasEmailSuccessful => {
    const emailStatus = $(".email-status");
    const alertText = $(".alert-text");
    const alert = $(".alert");
    if (wasEmailSuccessful === true) {
        emailStatus.text("Email sent! ");
        alertText.text("Thanks for getting in touch.");
        alert.addClass("alert-success");
        alert.removeClass("alert-danger");
    } else {
        emailStatus.text("Email not sent! ");
        alertText.text("Please try again.");
        alert.addClass("alert-danger");
        alert.removeClass("alert-success");
    }
};
