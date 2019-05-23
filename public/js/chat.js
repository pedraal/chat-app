const socket = io()

//Elements
const $messages = document.querySelector("#messages")
const $form = document.querySelector("form")
const $formSendButton = document.querySelector("#sendMessage")
const $formLocButton = document.querySelector("#sendLocation")
const $formMessageInput = document.querySelector("#message")
const $sidebar = document.querySelector("#sidebar")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild

  //Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //Visible height
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  //How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

//Socket events listener
socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("hh:mm a")
  })
  $messages.insertAdjacentHTML("beforeend", html)
  autoscroll()
})

socket.on("shareLocation", message => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("hh:mm a")
  })
  $messages.insertAdjacentHTML("beforeend", html)
})

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  $sidebar.innerHTML = html
})

//DOM events listener
$formSendButton.addEventListener("click", e => {
  e.preventDefault()

  $formSendButton.setAttribute("disabled", "disabled")

  let message = $formMessageInput.value
  socket.emit("sendMessage", message, error => {
    $formSendButton.removeAttribute("disabled")
    $formMessageInput.focus()

    if (error) {
      return console.log(error)
    }
    $formMessageInput.value = ""
  })
})

$formLocButton.addEventListener("click", e => {
  e.preventDefault()

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser")
  }
  $formLocButton.setAttribute("disabled", "disabled")

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit("sendLocation", { long: position.coords.longitude, lat: position.coords.latitude }, error => {
      $formLocButton.removeAttribute("disabled")
      if (error) {
        return console.log(error)
      }
    })
  })
})

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error)
    location.href = "/"
  }
})
