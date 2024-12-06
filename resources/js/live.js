document.addEventListener('DOMContentLoaded', () => {
  const currentClimber = document.getElementById('currentClimber')
  console.log(currentClimber)
  currentClimber.addEventListener('input', (event) => {
    console.log(event.target.value)
    document.querySelectorAll('tr[data-climber-row]').forEach((row) => {
      row.classList.remove('bg-orange-500/10')
    })
    document.querySelectorAll(`tr[data-order="${event.target.value}"]`).forEach((row) => {
      row.classList.add('bg-orange-500/10')
    })
  })
})
