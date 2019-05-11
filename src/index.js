require("normalize.css/normalize.css");
require("./styles/index.scss");

import PopperJs from "popper.js";
import jquery from "jquery";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/modal";

jquery(() => {
    console.log("Hello jQuery + bootstrap 4!");
});
