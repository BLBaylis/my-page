require("dotenv").config();
require("normalize.css/normalize.css");
require("./styles/index.scss");

import "regenerator-runtime/runtime.js";
import $ from "jquery";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/modal";
import "bootstrap/js/dist/alert";

$(() => {
    const contactForm = $(".contact-form");
    positionHomeVideo("DOMContentLoaded");
    $(".video").on("play", () => $(".side-bar").removeClass("side-bar--initial"));
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
    contactForm.on("animationend", () =>
        contactForm.removeClass("animate-contact")
    );
    $(".alert").on("transitionend", event => {
        const target = $(event.target);
        if (!target.hasClass("alert--hide")) {
            return;
        }
        target
            .addClass("alert--hidden")
            .removeClass("alert--hide alert--oldest");
        target.insertBefore(".alert--oldest");
    });
});

const positionHomeVideo = eventType => {
    const videoWrapperInner = $(".bg-video-wrapper-inner");
    const eventHandler = () => {
        const aspectRatio = $(window).width() / $(window).height();
        const height = document.querySelector(".video").offsetHeight;
        const width = 1.77 * height;
        const right = -0.39 * width;
        if (aspectRatio < 1.0875) {
            videoWrapperInner.css("right", right);
        } else if (aspectRatio <= 1.775) {
            videoWrapperInner.css("right", "initial");
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
    const name = $("#name").val();
    const email = $("#email").val();
    const message = $("#message").val();
    const toggleLoaderAnimation = () =>
        $(".lds-ring").toggleClass("animation-running");
    if (name === "" || email === "" || message === "") {
        $(event.target).addClass("animate-contact");
        return handleAlerts("warning");
    }
    toggleLoaderAnimation();
    await fetch(`${process.env.API_LINK}/contact`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
    })
        .then(res => res.json())
        .then(res => {
            if (res.emailSent === "false") {
                throw new Error("email not sent");
            }
            toggleLoaderAnimation();
            handleAlerts("primary");
        })
        .catch(err => {
            console.error(err);
            $(event.target).addClass("animate-contact");
            toggleLoaderAnimation();
            handleAlerts("danger");
        });
};

const handleAlerts = alertType => {
    let message;
    if (alertType === "primary") {
        message = "<strong>Email Sent. </strong><span>Thanks!</span>";
    } else if (alertType === "warning") {
        message = "Name, email or message missing!";
    } else {
        message =
            "<strong>Email didn't send. </strong><span>Try again later!</span>";
    }
    if ($(".alert--hidden").length === 2) {
        $("#alert1")
            .html(message)
            .removeClass("alert-danger alert-warning alert-primary")
            .addClass(`alert-${alertType} alert--oldest`)
            .removeClass("alert--hidden");
        $("#placeholder-alert").removeClass("initial");
    } else {
        if ($("#alert1").hasClass("initial")) {
            $("#alert1").removeClass("initial");
        }
        $(".alert--oldest").addClass("alert--hide");
        $(".alert--hidden")
            .html(message)
            .removeClass("alert-danger alert-warning alert-primary")
            .addClass(`alert-${alertType} alert--oldest`)
            .removeClass("alert--hidden");
    }
};
