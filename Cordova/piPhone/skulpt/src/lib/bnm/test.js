a = """
var $builtinmodule = function(name)
{
    var mod = {};
    var myfact = function(n) {
 if(n < 1) {
     return 1;
 } else {
     return n * myfact(n-1);
 }
    }
    mod.fact = new Sk.builtin.func(function(a) {
 return myfact(a);
    });

    mod.Stack = Sk.misceval.buildClass(mod, function($gbl, $loc) {
 $loc.__init__ = new Sk.builtin.func(function(self) {
     self.stack = [];
 });

 $loc.push = new Sk.builtin.func(function(self,x) {
     self.stack.push(x);
 });
 $loc.pop = new Sk.builtin.func(function(self) {
     return self.stack.pop();
 });
    },
    'Stack', []);


    return mod;
}
"""

print repr(a)