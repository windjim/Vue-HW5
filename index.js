Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const API_URL = "https://ec-course-api.hexschool.io/v2/api";
const PATH = "lovecorgi";

// 商品細節modal元件
const productModal = {
  props: ["templateProduct"],
  data() {
    return {
      bsModal: "",
      qty: 1,
    };
  },
  methods: {
    openModal() {
      // this.qty = 1;
      this.bsModal.show();
    },
    addCart() {
      this.$emit("addCart", this.templateProduct.id, this.qty);
      this.bsModal.hide();
    },
  },
  watch: {
    templateProduct() {
      this.qty = 1;
    },
  },
  template: "#userProductModal",
  mounted() {
    this.bsModal = new bootstrap.Modal(this.$refs.modal);
  },
};

const app = Vue.createApp({
  components: {
    productModal,
  },
  data() {
    return {
      state: {
        addCartLoading: "",
        deleteCartLoading: "",
      },
      productsList: [],
      templateProduct: {},
      cartList: [],
      user: {},
      message: "",
    };
  },
  methods: {
    getProducts() {
      axios.get(`${API_URL}/${PATH}/products/all`).then((res) => {
        this.productsList = res.data.products;
      });
    },
    addCart(id, qty = 1) {
      this.state.addCartLoading = id;
      const addProduct = {
        data: {
          product_id: `${id}`,
          qty,
        },
      };
      axios.post(`${API_URL}/${PATH}/cart`, addProduct).then((res) => {
        this.state.addCartLoading = "";
        alert(`${res.data.message}`);
        this.getCart();
      });
    },
    getCart() {
      axios.get(`${API_URL}/${PATH}/cart`).then((res) => {
        this.cartList = res.data.data;
      });
    },
    changeQty(order) {
      const changeOrderQty = {
        data: {
          product_id: `${order.product.id}`,
          qty: Number(`${order.qty}`),
        },
      };
      axios
        .put(`${API_URL}/${PATH}/cart/${order.id}`, changeOrderQty)
        .then((res) => {
          alert(`${res.data.message}`);
          this.getCart();
        });
    },
    deleteOrder(id = "") {
      if (!this.cartList.carts.length) {
        alert("沒東西給我去購物!");
        return;
      }
      let deleteUrl = "";
      id === ""
        ? (deleteUrl = `${API_URL}/${PATH}/carts`)
        : (deleteUrl = `${API_URL}/${PATH}/cart/${id}`);

      this.deleteCartLoading = id;
      axios.delete(deleteUrl).then((res) => {
        this.state.deleteCartLoading = "";
        alert(`${res.data.message}`);
        this.getCart();
      });
    },
    showModal(product) {
      this.templateProduct = product;
      this.$refs.controlModal.openModal();
    },
    emailRule(value) {
      const email = /^[\w\.-]+@(gmail\.com|yahoo\.com\.tw)$/;
      return email.test(value) ? true : "請輸入Gmail/Yahoo帳號";
    },
    phoneRule(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : "需要正確的電話號碼";
    },
    checkOrder() {
      const order = {
        data: {
          user: this.user,
          message: this.message,
        },
      };

      axios.post(`${API_URL}/${PATH}/order`, order).then((res) => {
        alert(`${res.data.message}`);
        this.cartList = {};
        this.user = {};
        this.message = "";
      });
    },
  },
  mounted() {
    this.getProducts();
    this.getCart();
  },
});
app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);

app.mount("#app");
