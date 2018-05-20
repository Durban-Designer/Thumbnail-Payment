<template>
  <div class="main">
    <div v-if="modal==='success'">
      <h2>Success</h2>
      <button class="back" v-on:click="$router.push('/')">Go Back</button>
    </div>
    <div class="regbox" v-else>
      <h1>Register</h1>
      <h3>Email:</h3>
      <input v-model="email" placeholder="user@gmail.com" />
      <h3>Password:</h3>
      <input v-model="password" placeholder="**********" />
      <h3>Name:</h3>
      <input v-model="name" placeholder="user st john"/>
      <button v-on:click="register">Register</button>
      <button v-on:click="$router.push('/')">Go Back</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'register',
  data: function () {
    return {
      modal: '',
      name: '',
      email: '',
      password: ''
    }
  },
  methods: {
    register () {
      let vue = this
      axios.post('https://api.thumbnailconsulting.com/users', {
        name: vue.name,
        email: vue.email,
        password: vue.password
      })
        .then(response => {
          vue.$emit('register', response.data)
        })
        .catch(response => {
          console.log(response)
        })
    }
  }
}
</script>

<style scoped lang="less">
  .regbox{
    height: 100%;
    width: 100%;
    background-repeat: repeat;
    margin-top: 120px;
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(12, 60px);
    position: fixed;
  }
  h1 {
    grid-row: 1;
    grid-column-start: 2;
    grid-column-end: 10;
    font-size: 2em;
    text-align: center;
  }
  h2 {
    text-align: center;
    margin-top: 30%;
  }
  h3 {
    text-align: center;
    grid-column-start: 1;
    grid-column-end: 11;
  }
  .back {
    text-align: center;
    margin-left: 33%;
    width: 33%;
    margin-top: 10%;
  }
  input {
    margin-top: 20px;
    grid-column-start: 2;
    grid-column-end: 10;
    border: 1px black solid;
  }
  button {
    box-shadow: 0px 3px 4px black;
    height: 2em;
    line-height: 1.4em;
    color: #fff;
    width: 100%;
    margin-bottom: 10px;
    grid-column-start: 2;
    grid-column-end: 10;
  }
  @media only screen and (min-width:750px) {
    .regbox{
      margin-top: 140px;
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      grid-template-rows: repeat(12, 100px);
    }
    input {
      margin-top: 40px;
      grid-column-start: 2;
      grid-column-end: 10;
      border: 1px black solid;
    }
  }
</style>
