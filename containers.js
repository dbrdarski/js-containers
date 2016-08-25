/**!
 * JavaScript Object Containers - by Dane Brdarski
 * 
 * Description: A little experiment. Inspired by functional programming containers, adapted for OOP.
 * Author: Dane Brdarski, dane.brdarski@gmail.com
 * License: MIT
 * Version: 0.0.1
 */

;(function() {
   'use strict';

   function Nothing(){
      return Nothing;
   }
   Nothing.isNothing = true;
   Nothing.log = Nothing.p = Nothing.m = Nothing.f = Nothing;

   function Failure(message){
      return FailureFactory(Failure, message);
   }
   function FailureFactory(me, data){
      function fail(){
         return fail;
      }
      fail.log = function(){
         console.log(data);
         return fail;
      };
      fail.m = fail.f = fail.p = fail;
      return fail;
   }
   
   function Container(data){
      return ContainerFactory(Container, data);
   }
   function ContainerFactory(me, data){
      function execute(action){
         if(arguments.length === 0){
            return data;
         }
         if(typeof action === 'function'){
            return execute.f.apply(null, arguments);
         }else if(typeof action === 'string'){
            return data[action] && typeof data[action] === 'function' ? execute.m.apply(null, arguments) : execute.p.apply(null, arguments);
         } else {
            return Nothing();
         }
      }
      execute.m = function(method){
         var args = Array.prototype.splice.call(arguments,1);
         var result = data[method].apply(data, args);
         return result === data ? execute : me(result);
      };
      execute.p = function(prop){
         return data[prop] ? me(data[prop]) : Nothing();
      };
      execute.f = function(fn){
         var result = fn(data, execute);
         return result === data ? execute : me(result);         
      };
      execute.check = function(){
         var args = arguments;
         return CheckFactory(me, data)(function(){ return execute.apply(execute, args)()});
      };
      execute.is = function(){
         var args = arguments;
         return CheckFactory(me, data)(function(){ return execute.apply(execute, arguments)()}).is();
      };
      execute.not = function(){
         var args = arguments;
         return CheckFactory(me, data)(function(){ return execute.apply(execute, arguments)()}).not();
      };
      execute.log = function(title){
         return execute;
      };
      return execute;
   }

   function Check(data){
      return CheckFactory(Check, data);
   }
   function CheckFactory(me, data){
      var onSuccess = function(){ return me(data) },
         onFailure = function(){ return Nothing() },
         conditionCheck,
         condition;

      function check(action){
         if(arguments.length === 0) {
            return check.resolve(1);
         } else {
            if(typeof action === 'function'){
               conditionCheck = action;
            }
            return check;
         }
      }

      check.onSuccess = function(fn){
         onSuccess = fn;
         return check;
      };
      check.onFailure = function(fn){
         onFailure = fn;
         return check;
      };
      check.is = function(){
         condition = function(result){ return !!result };
         return check;
      };
      check.not = function(){
         condition = function(result){ return !result };
         return check;
      };
      check.assert = function(n){
         condition = function(result){ return result===n; }
         return check;
      };
      check.resolve = function(){
         return condition(conditionCheck()) ? onSuccess() : onFailure();
      };
      return check;
   }

   var C = {
      Container : Container,
      Nothing : Nothing,
      Failure : Failure
   };

   if (typeof exports === 'object') {
      module.exports = C;
   } else if (typeof define === 'function' && define.amd) {
      define(function() { return C; });
   } else {
      this.C = C;
   }

}.call(this));