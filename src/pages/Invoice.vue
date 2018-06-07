<template>
  <div class="main">
    <div class="sent" v-if="modal==='sent'">
      <h2>Invoice Sent!!</h2>
      <button class="goBack" v-on:click="reset">Go Back</button>
    </div>
    <div class="invoicer" v-else>
      <h2>Invoicer mk1</h2>
      <input class="amount" v-model="amount" type="number" placeholder="Amount in USD" />
      <input class="customerEmail" v-model="customerEmail" placeholder="CustomerEmail@customer.com" />
      <input class="customerName" v-model="customerName" placeholder="Customer Name" />
      <input class="description" v-model="description" placeholder="Description of service offered" />
      <button class="send" v-on:click="createInvoice">Send Invoice</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'invoice',
  props: ['logged', 'user'],
  created () {
    if (this.logged !== true) {
      this.$router.push('/login')
    }
  },
  data: function () {
    return {
      modal: '',
      amount: 0,
      customerEmail: '',
      customerName: '',
      description: '',
      timeIssued: '',
      paid: false
    }
  },
  methods: {
    createInvoice () {
      let vue = this
      let amountCalc = (vue.amount * 100)
      axios.post('https://api.thumbnailconsulting.com/invoices', {
        amount: amountCalc,
        customerEmail: vue.customerEmail,
        customerName: vue.customerName,
        description: vue.description,
        timeIssued: new Date().toLocaleString(),
        paid: false
      }, {headers: { 'Authorization': 'JWT ' + vue.user.token }})
        .then(response => {
          console.log(response)
          vue.modal = 'sent'
        })
        .catch(err => {
          console.log(err)
        })
    },
    reset () {
      let vue = this
      vue.modal = ''
      vue.amount = 0
      vue.customerEmail = ''
      vue.customerName = ''
      vue.description = ''
      vue.timeIssued = ''
      vue.paid = false
    }
  }
}
</script>

<style scoped lang="less">
  .main {
    margin-top: 30%;
    margin-left: 10%;
  }
</style>
