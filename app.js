// Controller

// The single source of truth for all orders and bots
let allOrders = [];

let allBots = [];

// Counters for generating unique IDs
let orderIdCounter = 1;
let botIdCounter = 1;

// Global constant for cooking time
const COOKING_TIME_MS = 10000; // 10 seconds

// ID for the global countdown timer
let countdownIntervalId = setInterval(updateCountdownTimers, 1000);

// --- APPLICATION LOGIC (CONTROLLER) ---

const dispatchOrders = () => {
  const idleBots = allBots.filter(bot => bot.status === 'IDLE');
  const pendingOrders = allOrders.filter(order => order.status === 'PENDING');

  // VIP go first, then by ID
  pendingOrders.sort((a, b) => {
    if (a.type === 'VIP' && b.type === 'NORMAL') return -1;
    if (a.type === 'NORMAL' && b.type === 'VIP') return 1;
    return a.id - b.id;
  });

  for (let i = 0; i < Math.min(idleBots.length, pendingOrders.length); i++) {
    processOrder(idleBots[i], pendingOrders[i]);
  }
};

// Simulates a bot processing an order with new state tracking.
const processOrder = (bot, order) => {
  // Update state
  bot.status = 'BUSY';
  bot.orderId = order.id;
  order.status = 'IN_PROGRESS';

  // Set completion time and start the countdown timer if it's not already running
  order.completionTime = Date.now() + COOKING_TIME_MS;

  bot.timerId = setTimeout(() => {
    // Record completion details
    order.status = 'COMPLETE';
    order.completedAt = new Date();
    order.completedByBotId = bot.id;
    delete order.completionTime; // Clean up the property

    bot.status = 'IDLE';
    bot.orderId = null;
    bot.timerId = null;

    console.log(`Bot ${bot.id} completed Order #${order.id}.`);
    renderUI(); // Refresh UI when finished an order on a bot
    dispatchOrders();
  }, COOKING_TIME_MS);

  console.log(`Bot ${bot.id} started processing Order #${order.id}.`);
  renderUI();
};

const handleAddOrder = (type) => {
  const newOrder = { id: orderIdCounter++, type, status: 'PENDING' };
  allOrders.push(newOrder);
  console.log(`Created ${type} Order #${newOrder.id}`);
  renderUI();
  dispatchOrders();
};

const handleAddBot = () => {
  const newBot = { id: botIdCounter++, status: 'IDLE', orderId: null, timerId: null };
  allBots.push(newBot);
  console.log(`Bot ${newBot.id} created.`);
  renderUI();
  dispatchOrders();
};

const handleRemoveBot = () => {
  if (allBots.length === 0) {
    alert("No bots to remove.");
    return;
  }

  const botToRemove = allBots.pop();
  console.log(`Bot ${botToRemove.id} removed.`);

  if (botToRemove.status === 'BUSY') {
    clearTimeout(botToRemove.timerId);
    const orderToRequeue = allOrders.find(o => o.id === botToRemove.orderId);
    if (orderToRequeue) {
      orderToRequeue.status = 'PENDING';
      // NEW: Clean up completion time property
      delete orderToRequeue.completionTime;
      console.log(`Order #${orderToRequeue.id} returned to PENDING queue.`);
    }
  }

  renderUI();
  dispatchOrders();
};

document.addEventListener('DOMContentLoaded', () => {
  const addNormalBtn = document.getElementById('add-normal');
  const addVipBtn = document.getElementById('add-vip');
  const addBotBtn = document.getElementById('add-bot');
  const removeBotBtn = document.getElementById('remove-bot');

  // --- ATTACH EVENT LISTENERS ---
  addNormalBtn.addEventListener('click', () => handleAddOrder('NORMAL'));
  addVipBtn.addEventListener('click', () => handleAddOrder('VIP'));
  addBotBtn.addEventListener('click', handleAddBot);
  removeBotBtn.addEventListener('click', handleRemoveBot);

  // --- INITIAL RENDER ---
  renderUI();
});