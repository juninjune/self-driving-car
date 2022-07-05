function lerp(a,b,t){
    t = t<0?0:t;
    t = t>1?1:t;
    return a + (b-a)*t;
}