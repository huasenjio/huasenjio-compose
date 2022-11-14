import Vue from 'vue'

class EventBusTool {
    constructor() {
        this.$eventBus = new Vue()
    }
    pubEv(name, data) {
        this.$eventBus.$emit(name, data);
    }
    subEv(name, call) {
        this.$eventBus.$on(name, call);
    }
    subOnceEv(name, call) {
        this.$eventBus.$once(name, call)
    }
    unSubEv(name) {
        this.$eventBus.$off(name)
    }
}

export default new EventBusTool()