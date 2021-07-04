$(function() {


    // input file

    $(".c-file").each(function() {
        var $input = $(this).find("input"),
            $inputLabel = $(this).find(".c-file-name"),
            inputLabelVal = $inputLabel.html();

        $input.on("change", function(e) {
            var fileName = "";

            if (this.files && this.files.length > 1)
                fileName = (this.getAttribute("data-multiple-caption") || "").replace("{count}", this.files.length);
            else if (e.target.value) fileName = e.target.value.split("\\").pop();

            if (fileName) $inputLabel.html(fileName);
            else $inputLabel.html(inputLabelVal);
        });
    });

    // appl more

    $("[data-toggle]").on("click", function(event) {
        event.preventDefault();
        var data = $(this).data("toggle");
        $(data).slideToggle("fast");
    });


    // nav mob

    // $(".nav_mob-btn").on("click", function(event) {
    //     event.preventDefault();
    //     $(this).toggleClass("is-active");
    //     $(".nav_mob").slideToggle(400);
    // });
    //
    // nav-tabs_mob

    // $(".nav-tabs_mob").on("click", ".nav-tabs_mob-btn", function(event) {
    //     event.preventDefault();
    //     if ($(this).is(".is-active")) {
    //         $(this)
    //             .removeClass("is-active")
    //             .closest(".nav-tabs_mob")
    //             .removeClass("is-open");
    //     } else {
    //         $(this)
    //             .addClass("is-active")
    //             .closest(".nav-tabs_mob")
    //             .addClass("is-open");
    //     }
    // });

    // $(document).on("click", function(e) {
    //     if ($(e.target).closest(".nav-tabs_mob").length === 0) {
    //         $(".nav-tabs_mob, .nav-tabs_mob-btn").removeClass("is-active is-open");
    //     }
    // });

    // $(".cabinet_mob").on("click", ".cabinet_mob-link", function(event) {
    //     event.preventDefault();
    //     if ($(this).is(".is_link")) {
    //         window.location.href = $(this).find("a")[0].href;
    //     } else {
    //         if ($(this).is(".is-active")) {
    //             $(this)
    //                 .removeClass("is-active")
    //                 .closest(".cabinet_mob")
    //                 .removeClass("is-open");
    //         } else {
    //             $(this)
    //                 .addClass("is-active")
    //                 .closest(".cabinet_mob")
    //                 .addClass("is-open");
    //         }
    //     }
    // });
});
