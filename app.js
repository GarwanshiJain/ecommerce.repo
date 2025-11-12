// Shared JS for simple cart, mobile menu, and subscription
(function(){
  const CART_KEY = 'zay_cart';

  function getCart(){
    try{
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch(e){
      return [];
    }
  }

  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount(){
    const cart = getCart();
    const total = cart.reduce((s,i)=> s + (i.qty||0), 0);
    document.querySelectorAll('.c7').forEach(el => el.textContent = total);
  }

  function addToCart(item){
    const cart = getCart();
    const existing = cart.find(i=> i.id === item.id);
    if(existing){
      existing.qty += item.qty || 1;
    } else {
      cart.push(Object.assign({qty:1}, item));
    }
    saveCart(cart);
  }


  // toast helper
  function showToast(message){
    const wrap = document.querySelector('.toast-wrap');
    if(!wrap) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    wrap.appendChild(t);
    setTimeout(()=>{
      t.style.opacity = '0';
      t.style.transform = 'translateY(6px)';
      setTimeout(()=> t.remove(), 400);
    }, 2200);
  }

  // wire add to cart buttons
  document.addEventListener('click', function(e){
    const t = e.target.closest('.add-to-cart');
    if(!t) return;
    e.preventDefault();
    const id = t.dataset.id;
    const name = t.dataset.name;
    const price = parseFloat(t.dataset.price) || 0;
    if(!id || !name){
      alert('Product data missing');
      return;
    }
    addToCart({id,name,price});
    // visual feedback
    const original = t.textContent;
    t.textContent = 'Added ✓';
    showToast(`${name} added to cart`);
    setTimeout(()=> t.textContent = original, 1200);
  });

  // mobile menu toggle
  document.addEventListener('click', function(e){
    const t = e.target.closest('.mobile-menu-btn');
    if(!t) return;
    document.querySelectorAll('.home-link').forEach(el => el.classList.toggle('active'));
  });

  // newsletter/subscribe handling
  document.addEventListener('submit', function(e){
    const form = e.target;
    if(form.classList.contains('newsletter-form') || form.closest('.subscribe')){
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if(!input || !input.value){
        alert('Please enter a valid email address');
        return;
      }
      const subs = JSON.parse(localStorage.getItem('zay_subs')||'[]');
      if(!subs.includes(input.value)) subs.push(input.value);
      localStorage.setItem('zay_subs', JSON.stringify(subs));
      alert('Thanks — you are subscribed!');
      input.value = '';
    }
  });

  // Cart page actions (remove, clear)
  document.addEventListener('click', function(e){
    if(e.target.matches('.remove-item')){
      const id = e.target.dataset.id;
      let cart = getCart();
      cart = cart.filter(i=> i.id !== id);
      saveCart(cart);
      if(window.renderCart) window.renderCart();
    }

    if(e.target.matches('.clear-cart')){
      if(!confirm('Clear cart contents?')) return;
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      if(window.renderCart) window.renderCart();
    }
  });

  // helper to render cart table on cart.html
  window.renderCart = function(){
    const container = document.getElementById('cart-contents');
    if(!container) return;
    const cart = getCart();
    if(cart.length === 0){
      container.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }
    let html = '<table class="cart-table"><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th><th>Remove</th></tr></thead><tbody>';
    cart.forEach(item=>{
      html += `<tr><td>${item.name}</td><td>$${item.price.toFixed(2)}</td><td>${item.qty}</td><td>$${(item.price*item.qty).toFixed(2)}</td><td><button class="btn remove-item" data-id="${item.id}">Remove</button></td></tr>`;
    });
    const total = cart.reduce((s,i)=> s + (i.price*i.qty), 0);
    html += `</tbody></table><p class="total-row">Grand Total: $${total.toFixed(2)}</p><div style="text-align:right;margin-top:10px"><button class="btn clear-cart">Clear Cart</button></div>`;
    container.innerHTML = html;
  };

  // product data used by product.html when loaded without a backend
  window.PRODUCTS = {
    p1: {id:'p1', name:'Gym Weight', price:240, description:'High quality gym weight for strength training.'},
    p2: {id:'p2', name:'Cloud Nike Shoes', price:480, description:'Comfortable sports shoes for everyday running.'},
    p3: {id:'p3', name:'Summer Addides Shoes', price:360, description:'Breathable summer shoes.'}
  };

  // product page render
  window.renderProduct = function(){
    const el = document.getElementById('product-detail');
    if(!el) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const p = window.PRODUCTS[id] || null;
    if(!p){
      el.innerHTML = '<p>Product not found.</p>';
      return;
    }
    el.innerHTML = `<h1>${p.name}</h1><p style="color:#777;font-weight:600">$${p.price.toFixed(2)}</p><p>${p.description}</p><br><button class="btn add-to-cart" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">Add to Cart</button>`;
  };

  // initial setup
  document.addEventListener('DOMContentLoaded', function(){
    updateCartCount();
    if(document.getElementById('cart-contents')){
      window.renderCart();
    }
    if(document.getElementById('product-detail')){
      window.renderProduct();
    }
    // create toast wrapper
    if(!document.querySelector('.toast-wrap')){
      const wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
  });
})();