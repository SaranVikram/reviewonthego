var slice = [].slice;
!(function (e) {
  var r;
  function t(t, s) {
    var n, r, i;
    (this.options = e.extend({}, this.defaults, s)),
      (this.$el = t),
      this.createStars(),
      this.syncRating(),
      this.options.readOnly ||
        (this.$el.on(
          "mouseover.starrr",
          "a",
          ((n = this),
          function (t) {
            return n.syncRating(n.getStars().index(t.currentTarget) + 1);
          })
        ),
        this.$el.on(
          "mouseout.starrr",
          ((r = this),
          function () {
            return r.syncRating();
          })
        ),
        this.$el.on(
          "click.starrr",
          "a",
          ((i = this),
          function (t) {
            return (
              t.preventDefault(),
              i.setRating(i.getStars().index(t.currentTarget) + 1)
            );
          })
        ),
        this.$el.on("starrr:change", this.options.change));
  }
  (window.Starrr =
    ((t.prototype.defaults = {
      rating: void 0,
      max: 5,
      readOnly: !1,
      emptyClass: "wb-star-outline",
      fullClass: "wb-star",
      change: function (t, s) {},
    }),
    (t.prototype.getStars = function () {
      return this.$el.find("a");
    }),
    (t.prototype.createStars = function () {
      for (
        var t = [], s = 1, n = this.options.max;
        1 <= n ? s <= n : n <= s;
        1 <= n ? s++ : s--
      )
        t.push(this.$el.append("<a href='#' />"));
      return t;
    }),
    (t.prototype.setRating = function (t) {
      return (
        this.options.rating === t && (t = void 0),
        (this.options.rating = t),
        this.syncRating(),
        this.$el.trigger("starrr:change", t)
      );
    }),
    (t.prototype.getRating = function () {
      return this.options.rating;
    }),
    (t.prototype.syncRating = function (t) {
      var s, n, r, i, e;
      for (
        t = t || this.options.rating,
          s = this.getStars(),
          e = [],
          n = r = 1,
          i = this.options.max;
        1 <= i ? r <= i : i <= r;
        n = 1 <= i ? ++r : --r
      )
        e.push(
          s
            .eq(n - 1)
            .removeClass(
              n <= t ? this.options.emptyClass : this.options.fullClass
            )
            .addClass(n <= t ? this.options.fullClass : this.options.emptyClass)
        );
      return e;
    }),
    (r = t))),
    e.fn.extend({
      starrr: function () {
        var s = arguments[0],
          n = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        return this.each(function () {
          var t = e(this).data("starrr");
          if (
            (t || e(this).data("starrr", (t = new r(e(this), s))),
            "string" == typeof s)
          )
            return t[s].apply(t, n);
        });
      },
    });
})(window.jQuery);
