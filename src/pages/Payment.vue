<template>
  <div class="main">
    <div class="form-row" v-if="modal!=='thanks'">
      <h3>Total: {{invoice.ammount}}</h3>
      <div id="card-element"></div>
      <div id="card-errors" role="alert"></div>
      <button class="submit" v-on:click="submitCard" v-if="modal==='payment'">Submit Payment</button>
    </div>
    <div v-if="modal==='thanks'">
      <h1 class="thanks">Thank you for the Payment!!</h1>
      <button class="back" v-on:click="$router.push('/')">Go Back</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'donate',
  data () {
    return {
      modal: '',
      stripe: '',
      ammount: '',
      card: '',
      payment: '',
      stripeToken: '',
      error: '',
      invoice: {
        ammount: '',
        description: '',
        clientName: '',
        timeIssued: '',
        timePaid: '',
        paid: false

      }
    }
  },
  created () {
    this.stripeSetup()
  },
  methods: {
    stripeSetup () {
      let vue = this
      vue.modal = 'donate'
      vue.stripe = window.Stripe('pk_test_GfHvaGfRpGmaHgrzGAecyh2D')
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
      vue.ammount = parseInt(vue.ammount)
      vue.ammount = 100 * vue.ammount
      // https://api.endlesslovegraceandmercy.org
      axios.post('http://localhost:81/donate', {
        ammount: vue.ammount,
        stripeToken: vue.stripeToken
      })
        .then(function () {
          vue.error = false
          vue.payment = true
          vue.modal = 'thanks'
        })
        .catch(function (error) {
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
