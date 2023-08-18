// var REVIEW = REVIEW || {
//   init: function (e) {
//     var n = e[0],
//       i = JSON.parse(e[1]),
//       s = $(window).width() + 4;
//     function c(e) {
//       $.ajax({
//         url: "/review/add/click-stat",
//         method: "POST",
//         dataType: "json",
//         data: {
//           _csrf: n,
//           platformId: e.platformId,
//           urlId: "SELF_QR",
//           businessId: i.id,
//         },
//       });
//     }
// function l(r) {
//   const e = tinycolor(r);
//   (r && !e.isLight()) || (r = "66, 133, 244"),
//     $(".button-container .primary-btn, .btn-primary").css(
//       "background-color",
//       "rgb(" + r + ")"
//     ),
//     $(".btn-primary").css("border-color", "rgb(" + r + ")"),
//     $(".starrr a").css("color", "rgb(" + r + ")"),
//     $(".link.text-primary").css("color", "rgb(" + r + ")"),
//     $(".close").css("color", "rgb(" + r + ")"),
//     $("#review-form-modal").on("show.bs.modal", function (e) {
//       $(".button-container .primary-btn, .btn-primary").css(
//         "background-color",
//         "rgb(" + r + ")"
//       ),
//         $(".btn-primary").css("border-color", "rgb(" + r + ")"),
//         $(".starrr a").css("color", "rgb(" + r + ")"),
//         $(".link.text-primary").css("color", "rgb(" + r + ")"),
//         $(".close.text-primary").css("color", "rgb(" + r + ")");
//     });
// }
// $(document).ready(function () {
//   $("#logo_img").error(function () {
//     l("66, 133, 244");
//   });
//   var e = document.querySelector("#phone");
//   const t = window.intlTelInput(e, {
//     initialCountry: "in",
//     utilsScript:
//       "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
//   });
//   try {
//     if (i.theme) l(JSON.parse(i.theme));
//     else if (i.logo_img) {
//       var r = new Image();
//       r.src = window.location.origin + "/uploads/logo-img/" + i.logo_img;
//       const a = new ColorThief();
//       (r.onload = function () {
//         l(a.getColor(r));
//       }),
//         (r.onerror = function () {
//           console.log("invalid logo"), l("66, 133, 244");
//         });
//     } else l("66, 133, 244");
//     i.review_otp &&
//       ($("#submit-fb").prop("disabled", !0),
//       $("#otp-btn").prop("disabled", !0),
//       $("#otp-btn-wrapper").hide(),
//       $(".otp-verify-wrapper").hide(),
//       $("#phone").on("input", function (e) {
//         t.isValidNumber()
//           ? ($("#otp-btn").prop("disabled", !1), $("#otp-btn-wrapper").show())
//           : $("#otp-btn").prop("disabled", !0);
//       }),
//       $("#otp-btn").on("click", function () {
//         $.ajax({
//           url: "/apiV2/otp",
//           method: "GET",
//           dataType: "json",
//           data: { _csrf: n, recepient: t.getNumber(), businessId: i.id },
//           success: function (e) {
//             if (e.success) {
//               $(".otp-verify-wrapper").show(),
//                 $("#otp-btn").prop("disabled", !0);
//               var r = 30;
//               const o = setInterval(function () {
//                 $("#otp-msg").html("Resend code in " + r--);
//               }, 1e3);
//               setTimeout(function () {
//                 clearInterval(o),
//                   $("#otp-msg").html(""),
//                   $("#otp-msg").hide(),
//                   $("#otp-btn").prop("disabled", !1);
//               }, 3e4),
//                 $("#otp-verify-btn").on("click", function () {
//                   $.ajax({
//                     url: "/apiV2/otp",
//                     method: "POST",
//                     dataType: "json",
//                     data: {
//                       _csrf: n,
//                       recepient: t.getNumber(),
//                       businessId: i.id,
//                       otp: $(".feedback-otp").val(),
//                     },
//                     success: function (e) {
//                       e.success
//                         ? (clearInterval(o),
//                           $("#otp-btn").prop("disabled", !0),
//                           $("#otp-msg").hide(),
//                           $("#otp-verify-msg").hide(),
//                           $("#submit-fb").prop("disabled", !1),
//                           $("#otp-verify-btn").prop("disabled", !0))
//                         : ($("#otp-verify-msg").html(e.msg),
//                           $("#otp-verify-msg").show());
//                     },
//                     error: function (e) {
//                       e =
//                         e && e.responseJSON && e.responseJSON.msg
//                           ? e.responseJSON.msg
//                           : "Invalid OTP";
//                       $("#otp-verify-msg").html(e), $("#otp-verify-msg").show();
//                     },
//                   });
//                 });
//             } else
//               $("#review-form-modal .error")
//                 .text("Sorry! Some error occurred. Please try again later")
//                 .show();
//           },
//         });
//       }));
//   } catch (e) {
//     l("66, 133, 244");
//   }
$(document).ready(function () {
  $(".starrr").starrr();
  var o = 0;
  $(".starrr").on("starrr:change", function (e, r) {
    o = r;
  }),
    $("#submit-fb").on("click", function () {
      "" === $(".feedback-name").val()
        ? $("#review-form-modal .error").text("Please enter your name").show()
        : "" === $(".feedback-phone").val() ||
          $(".feedback-phone").val().length < 10
        ? $("#review-form-modal .error")
            .text("Please enter a valid phone number")
            .show()
        : "" === $(".feedback-text").val()
        ? $("#review-form-modal .error")
            .text("Please let us know how we can improve")
            .show()
        : 0 == o
        ? $("#review-form-modal .error")
            .text("Please select your preferred rating")
            .show()
        : i.review_otp &&
          ("" === $(".feedback-otp").val() ||
            $(".feedback-phone").val().length < 4)
        ? $("#review-form-modal .error")
            .text("Please enter a valid verfication code")
            .show()
        : $.ajax({
            url: "/review/add/qr/feedback",
            method: "POST",
            dataType: "json",
            data: {
              _csrf: n,
              name: $(".feedback-name").val(),
              phone: t.getNumber(),
              email: $(".feedback-email").val(),
              rating: o,
              feedback: $(".feedback-text").val(),
              businessId: i.id,
              otp: $(".feedback-otp").val(),
            },
            success: function (e) {
              e.success
                ? null == next_stage || -1 == next_stage
                  ? ($("#review-form-modal .modal-content")
                      .empty()
                      .html(
                        '<div style="padding:20px">Thank you for your valuable feedback.</div>'
                      ),
                    $("#review-form-modal .error").hide())
                  : setTimeout(function () {
                      var e = new URL(window.location.href);
                      e.searchParams.set("stage", next_stage),
                        (window.location = e.href);
                    }, 300)
                : $("#review-form-modal .error")
                    .text("Sorry! Some error occurred. Please try again later")
                    .show();
            },
          });
    }),
    $(".needs-improvement-click").on("click", function () {
      c({ platformId: null });
    }),
    $(".click-track").on("click", function () {
      c({ platformId: $(this).data("platform-id") });
    }),
    $(".top-border").css({ "border-right-width": s + "px" });
});

// });
//   }
// };
