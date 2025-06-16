// View: UI MANAGEMENT

/**
 * Renders the entire UI based on the global state of `allOrders` and `allBots`.
 */
const renderUI = () => {
  // --- DOM ELEMENTS ---
  const botsContainer = document.getElementById('bots-container');
  const pendingList = document.getElementById('pending-list');
  const inProgressList = document.getElementById('in-progress-list');
  const completeList = document.getElementById('complete-list');

  // --- Render Bots ---
  botsContainer.innerHTML = '';
  if (allBots.length === 0) {
    botsContainer.innerHTML = '<p>No bots available.</p>';
  } else {
    allBots.forEach(bot => {
      const statusClass = bot.status === 'IDLE' ? 'idle' : 'busy';
      const statusText = bot.status === 'IDLE' ? 'IDLE' : 'BUSY';
      const botCard = document.createElement('div');
      botCard.className = `card bot-card ${statusClass}`;

      // Bot's main status
      const botStatus = document.createElement('p');
      botStatus.style.margin = '0';
      botStatus.innerHTML = `<strong>Bot ${bot.id}:</strong> ${statusText}`;
      botCard.appendChild(botStatus);

      // NEW: Show the order the bot is currently processing
      if (bot.status === 'BUSY') {
        const botQueue = document.createElement('div');
        botQueue.style.marginTop = '8px';
        botQueue.style.fontSize = '0.9em';
        botQueue.innerHTML = `&rarr; Processing Order #${bot.orderId}`;
        botCard.appendChild(botQueue);
      }

      botsContainer.appendChild(botCard);
    });
  }

  // --- Render Orders ---
  pendingList.innerHTML = '';
  inProgressList.innerHTML = '';
  completeList.innerHTML = '';

  allOrders
    .sort((a, b) => {
      if (a.completedAt && b.completedAt) {
        return a.completedAt - b.completedAt
      }
      return a.id - b.id;
    })
    .forEach(order => {
      const orderCard = document.createElement('div');
      orderCard.className = `card order-card ${order.type.toLowerCase()}-order`;
      // Add a data attribute to easily find this card later for the timer
      orderCard.dataset.orderId = order.id;

      let cardContent = '';

      switch (order.status) {
        case 'PENDING':
          cardContent = `Order #${order.id} (${order.type})`;
          orderCard.innerHTML = cardContent;
          pendingList.appendChild(orderCard);
          break;
        case 'IN_PROGRESS':
          // Add a span with class = countdown, will be used to query select in updateCountdownTimers()
          cardContent = `Order #${order.id} (${order.type}) <span class="countdown"></span>`;
          orderCard.innerHTML = cardContent;
          inProgressList.appendChild(orderCard);
          break;
        case 'COMPLETE':
          // NEW: Show completion time and bot ID
          const timeString = order.completedAt.toLocaleTimeString();
          cardContent = `<strong>Order #${order.id}</strong><br><small>Completed by Bot ${order.completedByBotId} at ${timeString}</small>`;
          orderCard.innerHTML = cardContent;
          completeList.appendChild(orderCard);
          break;
      }
    });
};

// Updates all countdown timers in the 'IN PROGRESS' column.
const updateCountdownTimers = () => {
  const ordersInProgress = allOrders.filter(o => o.status === 'IN_PROGRESS');

  ordersInProgress.forEach(order => {
    const card = document.querySelector(`.order-card[data-order-id="${order.id}"]`);
    if (card) {
      const countdownSpan = card.querySelector('.countdown');
      if (countdownSpan) {
        const timeLeft = Math.round((order.completionTime - Date.now()) / 1000);
        countdownSpan.textContent = `(${timeLeft > 0 ? timeLeft : 0}s left)`;
      }
    }
  });
};