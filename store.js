
(function(){
  const FALLBACK_PRODUCTS=[
    {id:'sp1',title:'Kệ Bánh Kẹo Khai Trương Hồng Phát Tone Vàng Pastel',tag:'Quà tặng • Hoa & bánh kẹo',category:'Quà tặng',image_url:'sp1.jpg',gallery:['sp1.jpg'],price:null,material:'Bánh kẹo & quà tặng',occasion:'Khai trương · Chúc mừng',tone:'Vàng pastel – kem – tím pastel',size:'Kệ đứng / theo yêu cầu',description:'Mẫu kệ quà nhiều tầng, phối bánh kẹo và vật liệu trang trí theo tone pastel. Phù hợp quà khai trương nổi bật nhưng vẫn sáng và nhẹ mắt.',notes:['Có thể điều chỉnh số lượng quà và kích thước theo ngân sách.','Mẫu bao bì hoặc loại quà có thể thay đổi theo nguồn hàng thực tế.','Shop xác nhận lại bố cục, tone màu và thời gian giao trước khi thực hiện.'],active:true,featured:true,sort_order:1},
    {id:'sp2',title:'Kệ Hoa Chúc Mừng Happy Wedding Tone Hồng Kem Sang Trọng',tag:'Hoa theo dịp • Cưới – dạm ngõ',category:'Kệ & trụ hoa',image_url:'sp2.jpg',gallery:['sp2.jpg'],price:null,material:'Hoa thiết kế',occasion:'Cưới · Dạm ngõ · Chúc mừng',tone:'Hồng phấn – kem – trắng',size:'Kệ đứng / theo yêu cầu',description:'Mẫu kệ hoa tone hồng kem nhẹ, bố cục mềm và thanh lịch. Phù hợp không gian cưới, lễ chúc mừng hoặc quà tặng cần cảm giác trang nhã.',notes:['Hoa thực tế có thể thay bằng hoa tương đương theo mùa.','Có thể chỉnh tone hồng nhạt hơn, kem nhiều hơn hoặc thêm xanh xô thơm.','Shop xác nhận kích thước, nội dung bảng chúc mừng và thời gian giao trước khi làm.'],active:true,featured:true,sort_order:2},
    {id:'sp3',title:'Kệ Quà Bánh Kẹo & Đèn Lồng Sự Kiện Trung Thu Đoàn Viên',tag:'Hoa theo dịp • Ngày lễ / sự kiện',category:'Quà tặng',image_url:'sp3.jpg',gallery:['sp3.jpg'],price:null,material:'Bánh kẹo & quà sự kiện',occasion:'Trung Thu · Sự kiện · Chúc mừng',tone:'Đỏ – cam – xanh – vàng',size:'Kệ đứng / theo ngân sách',description:'Mẫu kệ quà Trung Thu nhiều màu, kết hợp bánh kẹo và chi tiết trang trí theo chủ đề lễ hội.',notes:['Có thể tăng hoặc giảm số lượng quà theo ngân sách.','Chi tiết trang trí theo mùa có thể thay đổi nhưng giữ tinh thần Trung Thu.','Shop chốt trước nội dung bảng, tone chính và kích thước kệ.'],active:true,featured:true,sort_order:3},
    {id:'sp4',title:'Bó Hoa Tone Trắng Thuần Khiết Size Lớn',tag:'Bó hoa • Bó nghệ thuật',category:'Bó hoa',image_url:'sp4.jpg',gallery:['sp4.jpg'],price:null,material:'Hoa tươi',occasion:'Sinh nhật · Kỷ niệm · Chúc mừng',tone:'Trắng – kem – xanh dịu',size:'Bó lớn',description:'Mẫu bó hoa size lớn với bảng màu trắng kem, tập trung vào cảm giác sạch, thanh lịch và nhẹ nhàng.',notes:['Hoa thực tế có thể thay đổi theo độ nở, mùa và nguồn hàng.','Có thể điều chỉnh kích thước bó và tỷ lệ giấy theo ngân sách.','Shop tư vấn trước nếu cần thay hoa để vẫn giữ đúng tone và tinh thần mẫu.'],active:true,featured:true,sort_order:4}
  ];
  const CART_KEY='kimFloraCartV3';
  let _client=null,_productsCache=null;
  function cfg(){return window.KF_SUPABASE||{url:'',anonKey:''}}
  function isConfigured(){const c=cfg();return !!(c.url&&c.anonKey&&window.supabase)}
  function client(){if(!isConfigured())return null;if(!_client)_client=window.supabase.createClient(cfg().url,cfg().anonKey);return _client}
  function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function money(n){const v=Number(n);return Number.isFinite(v)?new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(v):'Liên hệ báo giá'}
  async function loadProducts(opts={}){
    const activeOnly=opts.activeOnly!==false, force=!!opts.force;
    if(_productsCache&&!force&&activeOnly)return _productsCache;
    const c=client();
    if(c){
      let q=c.from('products').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});
      if(activeOnly)q=q.eq('active',true);
      const {data,error}=await q;
      if(!error&&Array.isArray(data)){if(activeOnly)_productsCache=data;return data}
      console.warn('Supabase products fallback:',error);
    }
    return FALLBACK_PRODUCTS.filter(x=>!activeOnly||x.active);
  }
  async function getProduct(id){
    const c=client();
    if(c){const {data,error}=await c.from('products').select('*').eq('id',id).maybeSingle();if(!error&&data)return data}
    return FALLBACK_PRODUCTS.find(x=>String(x.id)===String(id))||null;
  }
  async function loadArticles(){
    const c=client();
    if(c){const {data,error}=await c.from('articles').select('*').eq('active',true).order('sort_order',{ascending:true});if(!error)return data||[]}
    return [
      {id:'care1',title:'Cách dưỡng hoa tươi sau khi nhận',content:'Đặt hoa ở nơi mát, tránh nắng trực tiếp và luồng máy lạnh thổi mạnh. Với bình nước, thay nước sạch mỗi ngày và cắt lại gốc 1–2 cm. Với giỏ/hộp cắm foam, châm nước từ từ vào phần foam mỗi ngày, tránh làm ướt cánh hoa.'},
      {id:'care2',title:'Cách bảo quản hoa sáp',content:'Để hoa nơi khô thoáng, tránh nắng gắt, hơi nước và nơi quá nóng. Không xịt nước hoặc nước hoa trực tiếp lên cánh. Khi có bụi, dùng cọ mềm hoặc máy sấy chế độ gió mát ở khoảng cách vừa phải.'}
    ]
  }
  async function getSetting(key){const c=client();if(!c)return null;const {data,error}=await c.from('site_settings').select('value').eq('key',key).maybeSingle();return error?null:(data?.value||null)}
  function getCart(){try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch{return []}}
  function saveCart(cart){localStorage.setItem(CART_KEY,JSON.stringify(cart));updateCartCount();window.dispatchEvent(new CustomEvent('kf-cart-change',{detail:cart}))}
  function addToCart(id,qty=1){qty=Math.max(1,Number(qty)||1);const cart=getCart();const found=cart.find(x=>String(x.id)===String(id));if(found)found.qty+=qty;else cart.push({id:String(id),qty});saveCart(cart)}
  function setQty(id,qty){const cart=getCart();const item=cart.find(x=>String(x.id)===String(id));if(!item)return;if(Number(qty)<=0)return removeFromCart(id);item.qty=Math.max(1,Number(qty)||1);saveCart(cart)}
  function removeFromCart(id){saveCart(getCart().filter(x=>String(x.id)!==String(id)))}
  function clearCart(){saveCart([])}
  function cartCount(){return getCart().reduce((s,x)=>s+Number(x.qty||0),0)}
  function updateCartCount(){document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=cartCount())}
  async function hydrateCart(){const cart=getCart();const products=await Promise.all(cart.map(x=>getProduct(x.id)));let total=0,hasQuote=false;const rows=[];cart.forEach((item,i)=>{const p=products[i];if(!p)return;const price=p.price===null||p.price===''?null:Number(p.price);if(Number.isFinite(price))total+=price*item.qty;else hasQuote=true;rows.push({...item,product:p,price});});return {rows,total,hasQuote}}
  async function getSession(){const c=client();if(!c)return null;const {data}=await c.auth.getSession();return data.session||null}
  async function signInOAuth(provider,redirectPage='account.html'){const c=client();if(!c)throw new Error('Chưa cấu hình Supabase');const redirectTo=location.origin+'/'+String(redirectPage).replace(/^\//,'');return c.auth.signInWithOAuth({provider,options:{redirectTo}})}
  async function signOut(){const c=client();if(c)await c.auth.signOut()}
  async function refreshAccountUI(){const session=await getSession();document.querySelectorAll('[data-account-label]').forEach(el=>el.textContent=session?.user?.email?'Tài khoản':'Đăng nhập');return session}
  async function createOrder(payload){const c=client();if(!c)throw new Error('Website chưa kết nối cơ sở dữ liệu.');const {data,error}=await c.from('orders').insert(payload).select('*').single();if(error)throw error;return data}
  async function myOrders(){const c=client();const s=await getSession();if(!c||!s)return[];const {data,error}=await c.from('orders').select('*').eq('user_id',s.user.id).order('created_at',{ascending:false});if(error)throw error;return data||[]}
  async function isAdmin(){const c=client();const s=await getSession();if(!c||!s)return false;const {data,error}=await c.from('admins').select('user_id').eq('user_id',s.user.id).maybeSingle();return !error&&!!data}
  async function adminProducts(){const c=client();if(!c)return FALLBACK_PRODUCTS;const {data,error}=await c.from('products').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:false});if(error)throw error;return data||[]}
  async function saveProduct(product){const c=client();if(!c)throw new Error('Chưa kết nối Supabase');const payload={...product,updated_at:new Date().toISOString()};if(payload.id&&String(payload.id).startsWith('sp'))delete payload.id;const pid=payload.id||null;if(pid)delete payload.id;const {data,error}=pid?await c.from('products').update(payload).eq('id',pid).select().single():await c.from('products').insert(payload).select().single();if(error)throw error;_productsCache=null;return data}
  async function deleteProduct(id){const c=client();if(!c)throw new Error('Chưa kết nối Supabase');const {error}=await c.from('products').delete().eq('id',id);if(error)throw error;_productsCache=null}
  function safeName(name){return String(name||'image.jpg').toLowerCase().replace(/[^a-z0-9._-]+/g,'-')}
  async function uploadImage(file,bucket='product-images',prefix='products'){const c=client();if(!c)throw new Error('Chưa kết nối Supabase');const path=`${prefix}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safeName(file.name)}`;const {error}=await c.storage.from(bucket).upload(path,file,{upsert:false,cacheControl:'3600'});if(error)throw error;const {data}=c.storage.from(bucket).getPublicUrl(path);return data.publicUrl}
  async function adminOrders(){const c=client();if(!c)return[];const {data,error}=await c.from('orders').select('*').order('created_at',{ascending:false});if(error)throw error;return data||[]}
  async function updateOrder(id,patch){const c=client();const {data,error}=await c.from('orders').update(patch).eq('id',id).select().single();if(error)throw error;return data}
  async function adminArticles(){const c=client();if(!c)return[];const {data,error}=await c.from('articles').select('*').order('sort_order',{ascending:true});if(error)throw error;return data||[]}
  async function saveArticle(a){const c=client();const payload={...a,updated_at:new Date().toISOString()};const aid=payload.id||null;if(aid)delete payload.id;const {data,error}=aid?await c.from('articles').update(payload).eq('id',aid).select().single():await c.from('articles').insert(payload).select().single();if(error)throw error;return data}
  async function deleteArticle(id){const c=client();const {error}=await c.from('articles').delete().eq('id',id);if(error)throw error}
  async function saveSetting(key,value){const c=client();const {data,error}=await c.from('site_settings').upsert({key,value,updated_at:new Date().toISOString()}).select().single();if(error)throw error;return data}
  window.KFStore={FALLBACK_PRODUCTS,isConfigured,client,esc,money,loadProducts,getProduct,loadArticles,getSetting,getCart,saveCart,addToCart,setQty,removeFromCart,clearCart,cartCount,updateCartCount,hydrateCart,getSession,signInOAuth,signOut,refreshAccountUI,createOrder,myOrders,isAdmin,adminProducts,saveProduct,deleteProduct,uploadImage,adminOrders,updateOrder,adminArticles,saveArticle,deleteArticle,saveSetting};
  document.addEventListener('DOMContentLoaded',()=>{updateCartCount();refreshAccountUI().catch(()=>{})});
})();
