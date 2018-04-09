# mvvm-simple

mvvm原理分析

JavaScript在浏览器中操作HTML经历了几个不同阶段

> 第一阶段
直接用浏览器提供的原生API操作DOM元素

    var dom = document.getElementById('id');
    dom.innerHTML = 'hello mvvm';
    
> 第二阶段
jQuery的出现解决了原生API的复杂性和浏览器间的兼容性等问题，提供了更加简易方便的API

    $('#id').text('hello mvvm')
    
> 第三阶段
MVC模式使前端可以和后端配合，修改服务端渲染后的页面内容

而随着产品对于用户体验的重视，交互体验越来越重要，仅用jQuery远远不够。
MVVM模型解决了频繁操作的痛点，Model-View-ViewModel模式将数据与视图的同步交由ViewModel完成

jQuery修改节点内容:

    <p>name: <span id="name">vist</span>!</p>
    <p>age: <span id="age">25</span>.</p> 
    
    var name = 'bestvist';
    var age = 26;
    $('#name').text(name);
    $('#age').text(age);
    
MVVM模式下只需要关注数据结构:

    var me = {
        name: 'vist',
        age: 25
    }
    修改相应属性就好
    me.name = 'bestvist';
    me.age = 26;
    
  