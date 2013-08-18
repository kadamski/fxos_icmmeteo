if(!String.prototype.format) {
    String.prototype.format = function format() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, p) { 
            return (typeof args[p] != 'undefined') ? args[p] : match; 
        });
    }
}
