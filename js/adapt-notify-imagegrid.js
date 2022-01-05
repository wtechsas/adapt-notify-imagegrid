
define([
    'core/js/adapt',
    'core/js/views/componentView'
], function(Adapt, ComponentView) {

    var Notifyimagegrid = ComponentView.extend({

        preRender: function () {
            this.listenTo(Adapt, 'device:changed', this.resizeControl);

            this.setDeviceSize();
            this.checkIfResetOnRevisit();
        },

        events: function() {
            return Adapt.device.touch == true ? {
                'inview': 'inview',
                'click button' : 'gridnotifyPopup'
            } : {
                'inview': 'inview',
                'mouseover button': 'completePopup',
                'click button' : 'gridnotifyPopup'
            }
        },

        setDeviceSize: function() {
            if (Adapt.device.screenSize === 'large') {
                this.$el.addClass('desktop').removeClass('mobile');
                this.model.set('_isDesktop', true);
            } else {
                this.$el.addClass('mobile').removeClass('desktop');
                this.model.set('_isDesktop', false);
            }
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$('.component-widget').off('inview');
                    this.completePopup();
                }

            }
        },

        remove: function() {
          // Remove any 'inview' listener attached.
          this.$('.component-widget').off('inview');

          ComponentView.prototype.remove.apply(this, arguments);
        },

        postRender: function() {
            this.setUpColumns();

            this.$('.notify-imagegrid-widget').imageready(_.bind(function() {
                this.setReadyStatus();

                // Bind 'inview' once the image is ready.
                this.$('.component-widget').on('inview', _.bind(this.inview, this));

            }, this));

            this.reverseDirection();
            this.constrainHeight();
        },

        resizeControl: function() {
            this.setDeviceSize();
            this.render();
        },

        reverseDirection: function() {

            if (this.model.get('_reverseDirection') && this.model.get('_isEnabled')) {
                this.$(".notify-imagegrid-grid-inner").addClass("reverserow");
            }
        },

        constrainHeight: function() {
            var rowheight = this.model.get('_gridrowHeight')._heightAmount;

            if ( this.model.get('_gridrowHeight')._constrainHeight && this.model.get('_isEnabled')) {
                this.$(".notify-imagegrid-item-image img").addClass("constrainimg");
                this.$(".constrainimg").css({"max-height": rowheight + 'px',"min-height": rowheight + 'px'});
            }
        },

        setUpColumns: function() {
            var columns = this.model.get('_columns');

            if (columns && Adapt.device.screenSize === 'large') {
                var griditempercent = (100 / columns);
                var gridminuspad = (5 / columns);
                this.$('.notify-imagegrid-grid-item').css('width', griditempercent + '%');
            }
        },

        completePopup: function () {
            var mycurrentid = '.' + this.model.get('_id');
            var howmanygridimg = $(mycurrentid + " .howmanygrid").length;
            var howmanystr = $(mycurrentid + " .totalgrid").text();
            
            if (howmanystr >= howmanygridimg ) {
                this.setCompletionStatus();
            } else if (howmanygridimg == 0) {
                this.setCompletionStatus();
            }
        }, 

        gridnotifyPopup: function (event) {
            event.preventDefault();

            this.model.set('_active', false);

            var mycurrentid = '.' + this.model.get('_id');
            var howmanygridimg = $(mycurrentid + " .howmanygrid").length;
            var howmanystr = $(mycurrentid + " .totalgrid").text();
            var count = howmanystr;

            var index = $(event.currentTarget).parent().data('index');
            var mypopuptitle = this.model.get('_items')[index]._graphic.title;
            var mypopupmsg = this.model.get('_items')[index]._graphic.gridmessage;

            var imgridObject = {
                title: mypopuptitle,
                body: mypopupmsg,
                _classes: ' imgnotifygrid'
            };

            if (!$(event.currentTarget).hasClass("click4count")) {
                count++;
                $(mycurrentid + " .totalgrid").html(""+count);
            }else{
                //DO NOT COUNT
            }

            Adapt.trigger('notify:popup', imgridObject);

            $(event.currentTarget).addClass("click4count");
            
            if (howmanystr >= howmanygridimg ) {
                this.setCompletionStatus();
            } else if (howmanygridimg == 0) {
                this.setCompletionStatus();
            }
        }

    },{
        template: "notify-imagegrid"
    });

    return Adapt.register("notify-imagegrid", Notifyimagegrid);
});
