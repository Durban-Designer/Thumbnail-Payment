<template>
  <div class="main">
    <div class="form-row" v-if="modal!=='thanks' && modal!=='alreadyPaid'">
      <h3>Total: ${{invoice.amount}}</h3>
      <p>To be paid to Thumbnail Consulting by {{invoice.clientName}} for;</p>
      <p>{{invoice.description}}</p>
      <div id="card-element"></div>
      <div id="card-errors" role="alert"></div>
      <button class="submit" v-on:click="submitCard" v-if="modal==='payment'">Submit Payment</button>
    </div>
    <div v-if="modal==='thanks'">
      <h1 class="thanks">Thank you for the Payment!!</h1>
      <button class="back" v-on:click="$router.push('/')">Go Back</button>
    </div>
    <div v-if="modal==='alreadyPaid'">
      <h1 class="thanks">This Invoice has already been Paid on {{invoice.timePaid}}, Thank you for your timely payment!!</h1>
      <button class="back" v-on:click="$router.push('/')">Go Back</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'payment',
  props: ['invoiceid'],
  data () {
    return {
      modal: '',
      stripe: '',
      card: '',
      payment: '',
      stripeToken: '',
      error: '',
      invoice: {
        amount: '',
        description: '',
        clientName: '',
        timeIssued: '',
        timePaid: '',
        paid: false

      }
    }
  },
  created () {
    let vue = this
    axios.get('https://api.thumbnailconsulting.com/invoices/' + vue.invoiceid)
      .then(response => {
        vue.invoice.amount = (parseInt(response.data.amount) / 100)
        vue.invoice.description = response.data.description
        vue.invoice.clientName = response.data.customerName
        vue.invoice.timeIssued = response.data.timeIssued
        vue.invoice.timePaid = response.data.timePaid
        vue.invoice.paid = response.data.paid
        if (vue.invoice.paid !== true) {
          vue.stripeSetup()
        } else {
          vue.modal = 'alreadyPaid'
        }
      })
      .catch(err => {
        console.log(err)
        vue.$router.push('/')
      })
  },
  methods: {
    stripeSetup () {
      let vue = this
      vue.modal = 'payment'
      vue.stripe = window.Stripe('pk_test_EUZwPeinKym4DDl0d9kMbrOw')
      var elements = vue.stripe.elements()
      var style = {
        base: {
          color: '#32325d',
          lineHeight: '18px',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
      vue.card = elements.create('card', {style: style})
      vue.card.mount('#card-element')
      vue.card.addEventListener('change', function (event) {
        var displayError = document.getElementById('card-errors')
        if (event.error) {
          displayError.textContent = event.error.message
        } else {
          displayError.textContent = ''
        }
      })
    },
    submitCard () {
      let vue = this
      vue.stripe.createToken(vue.card).then(function (result) {
        if (result.error) {
          const errorElement = document.getElementById('card-errors')
          errorElement.textContent = result.error.message
          console.log(result.error)
        } else {
          vue.stripeTokenHandler(result.token.id)
        }
      })
    },
    stripeTokenHandler (token) {
      let vue = this
      vue.stripeToken = token
      axios.post('https://api.thumbnailconsulting.com/invoices/pay', {
        invoiceid: vue.invoiceid,
        stripeToken: vue.stripeToken,
        timePaid: new Date().toLocaleString()
      })
        .then(response => {
          vue.error = false
          vue.payment = true
          vue.modal = 'thanks'
        })
        .catch(error => {
          console.log(error)
          vue.error = true
        })
    }
  }
}
</script>

<style scoped lang="less">
@red: #c90c2e;
@grey: #323d38;
  .main {
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
    position: fixed;
    margin-top: 100px;
  }
  .donate {
    grid-column: 2;
  }
  .donate button {
    text-align: center;
    width: 50%;
    margin-left: 25%;
    font-size: 2em;
    line-height: 1.6em;
  }
  .StripeElement {
    background-color: white;
    height: 40px;
    width: 90%;
    margin-left: 5%;
    margin-top: 20px;
    margin-bottom: 20px;
    padding: 10px 12px;
    border: 1px solid @grey;
    box-shadow: 0 1px 3px 0 #e6ebf1;
    -webkit-transition: box-shadow 150ms ease;
    transition: box-shadow 150ms ease;
  }

  .StripeElement--focus {
    box-shadow: 0 1px 3px 0 #cfd7df;
  }

  .StripeElement--invalid {
    border-color: @grey;
  }

  .StripeElement--webkit-autofill {
    background-color: #fefde5 !important;
  }
  .form-row {
    text-align: center;
    width: 100%;
    height: 200px;
    line-height: 2em;
    margin-top: 20px;
    padding-top: 10px;
    grid-column-start: 1;
    grid-column-end: 4;
  }
  .thanks {
    font-size: 2em;
    text-align: center;
    margin-top: 200px;
  }
  .back {
    font-size: 2em;
    text-align: center;
    margin-top: 40px;
    width: 50%;
    margin-left: 25%;
  }
</style>
