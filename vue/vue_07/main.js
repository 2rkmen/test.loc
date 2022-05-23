Vue.component('task', {

    template: '<li><slot></slot></li>',

    data(){
        return {
            message: 'foobar'
        };
    }

});


new Vue({
    el: '#root'
})

