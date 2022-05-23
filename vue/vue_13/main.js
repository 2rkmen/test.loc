//это чтобы передавать инфу между компонентами, которые между собой не связаны
window.Event = new class{
   constructor() {
      this.vue = new Vue();
   }

   fire(event, data = null){
      this.vue.$emit(event,data);
   }

   listen(event, callback){
      this.vue.$on(event, callback);
   }
}

Vue.component('coupon', {
   template: '<input placeholder="введите код купона" @blur="onCouponApplied">',

   methods: {
      onCouponApplied() {
         console.log('couponn blur');
         Event.fire('applied');
      }

   }
});

new Vue({
   el: '#root',

   data:{
      couponApplied: false
   },
   created() {
      Event.listen('applied', () => alert('Handling it'));
   },
   methods:{
      onCouponApplied() {
          console.log('it was applied');
          alert('it was applied');
         this.couponApplied = true;
      }
   }
});
