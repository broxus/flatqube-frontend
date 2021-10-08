/* eslint-disable */
export default {
    OPEN_IN_EXPLORER: 'Open in explorer',

    NAV_LINK_SOON_HINT: ' soon',
    NAV_LINK_TEXT_SWAP: 'Swap',
    NAV_LINK_TEXT_POOLS: 'Pools',
    NAV_LINK_TEXT_TOKENS: 'Tokens',
    NAV_LINK_TEXT_PAIRS: 'Pairs',
    NAV_LINK_TEXT_FARMING: 'Farming',
    NAV_LINK_TEXT_BUILDER: 'Builder',

    WALLET_CONNECTING_POPUP_TITLE: 'Connect to a wallet',
    WALLET_CONNECTING_POPUP_LEAD_WALLET_NAME: 'Crystal Wallet',
    WALLET_CONNECTING_POPUP_LEAD_IN_PROCESS: 'Initializing...',
    WALLET_UPDATING_POPUP_LEAD_IS_OUTDATED: 'Extension version is outdated',
    WALLET_UPDATING_POPUP_NOTE: '<p>Your wallet version is too old. Please update extension at <a href="https://chrome.google.com/webstore/detail/ton-crystal-wallet/cgeeodpfagjceefieflmdfphplkenlfk">chrome.google.com</a> or local, through chrome://extensions/.</p><p>Reload this page after installing the update.</p>',
    WALLET_UPDATING_LINK_TEXT: 'Update Crystal Wallet',
    WALLET_INSTALLATION_LINK_TEXT: 'Install Crystal Wallet',
    WALLET_INSTALLATION_NOTE: '<p>At the moment, only Crystal Wallet supports TON Swap.</p><p>If you haven’t installed the extension yet, you can do it at <a href="https://chrome.google.com/webstore/category/extensions" target="_blank" rel="nofollow noopener noreferrer">chrome.google.com</a></p>',

    WALLET_BALANCE_HINT: '{balance} TON',
    WALLET_BTN_TEXT_CONNECT: 'Connect to a wallet',

    PAGINATION_BEFORE_TEXT: 'Page',
    PAGINATION_PAGE_OF: 'of {totalPages}',

    SWAP_HEADER_TITLE: 'Swap tokens',
    SWAP_SETTINGS_DROP_TITLE: 'Transaction Settings',
    SWAP_SETTINGS_DROP_NOTE: 'Slippage tolerance',
    SWAP_FIELD_TOKEN_WALLET_BALANCE: 'Balance: {balance}',
    SWAP_FIELD_LABEL_LEFT: 'From',
    SWAP_FIELD_LABEL_RIGHT: 'To',
    SWAP_FIELD_BTN_TEXT_SELECT_TOKEN: 'Select a token',
    SWAP_PRICE_LABEL: 'Optimal price',
    SWAP_PRICE_CROSS_EXCHANGE_AVAILABLE_LABEL: 'Cross-exchange available',
    SWAP_PRICE_CROSS_EXCHANGE_MODE_LABEL: 'Get a better price',
    SWAP_PRICE_DIRECT_EXCHANGE_MODE_LABEL: 'Back to direct swap',
    SWAP_PRICE_CROSS_EXCHANGE_MODE_ONLY_LABEL: 'Cross-exchange only',
    SWAP_PRICE_RESULT: '{value} {leftSymbol}&nbsp;per&nbsp;{rightSymbol}',
    SWAP_BTN_TEXT_SELECT_A_TOKEN: 'Select a token',
    SWAP_BTN_TEXT_ENTER_AN_AMOUNT: 'Enter an amount',
    SWAP_BTN_TEXT_NOT_ENOUGH_LIQUIDITY: 'Not enough liquidity',
    SWAP_BTN_TEXT_INSUFFICIENT_TOKEN_BALANCE: 'Insufficient <s>{symbol}</s> balance',
    SWAP_BTN_TEXT_ROUTE_DOES_NOT_EXIST: 'Route doesn’t exist',
    SWAP_BTN_TEXT_SUBMIT: 'Swap',
    SWAP_BTN_TEXT_CONFIRM_SUBMIT: 'Confirm',
    SWAP_BTN_TEXT_CONFIRMATION_AWAIT: 'Await confirmation...',
    SWAP_BILL_LABEL_ROUTE: 'Route',
    SWAP_BILL_LABEL_SLIPPAGE: 'Slippage tolerance',
    SWAP_BILL_LABEL_MINIMUM_RECEIVE: 'Minimum receive',
    SWAP_BILL_RESULT_MINIMUM_RECEIVE: '<span>{value}</span> {symbol}',
    SWAP_BILL_LABEL_PRICE_IMPACT: 'Price impact',
    SWAP_BILL_RESULT_PRICE_IMPACT: '<span>&lt;{value}%</span>',
    SWAP_BILL_LABEL_FEE: 'Liquidity Provider Fee',
    SWAP_BILL_RESULT_FEE: '<span>{value}</span> {symbol}',
    SWAP_POPUP_CONFORMATION_TITLE: 'Confirm transaction',
    SWAP_TRANSACTION_RECEIPT_POPUP_TITLE_SUCCESS: 'Swap has been completed successfully',
    SWAP_TRANSACTION_RECEIPT_POPUP_TITLE_FAILURE: 'Swap cancelled',
    SWAP_TRANSACTION_RECEIPT_LEAD_RECEIVED_AMOUNT: '+ <span>{value}</span> {symbol}',
    SWAP_TRANSACTION_RECEIPT_LINK_TXT_TOKEN_ROOT_CONTRACT: 'Token root contract',
    SWAP_TRANSACTION_RECEIPT_LINK_TXT_TRANSACTION: 'Transaction result',
    SWAP_TRANSACTION_RECEIPT_CANCELLED_NOTE: '<p>The Swap was canceled. Your balance hasn’t changed.</p>',
    SWAP_TRANSACTION_RECEIPT_CROSS_EXCHANGE_CANCELLED_NOTE: 'Due to the slippage is more than {slippage}% of the {leftSymbol}/{rightSymbol} pair, you stayed with {leftSymbol} token.',

    TOKENS_LIST_POPUP_TITLE: 'Select a token',
    TOKENS_LIST_POPUP_FIELD_SEARCH_PLACEHOLDER: 'Enter a token name or address...',
    TOKENS_LIST_POPUP_NO_RESULTS: 'No results found',
    TOKENS_LIST_POPUP_BTN_TEXT_IMPORT_TOKEN: 'Import',
    TOKENS_LIST_POPUP_IMPORT_TOKEN_TITLE: 'Import token',
    TOKENS_LIST_POPUP_IMPORT_TOKEN_WARNING: 'This token doesn’t appear on the active token list(s). Make sure this is the token that you want to trade.',

    ACCOUNT_CONNECTOR_NOTE: 'You need to connect account, before you can continue. Account connection for this wallet occurs only once. You will not need to go through this procedure in the future.',
    ACCOUNT_CONNECTOR_BUTTON: 'Connect account',

    POOLS_LIST_CONNECT_WALLET_TITLE: 'Your liquidity positions will appear here.',
    POOLS_LIST_TITLE: 'Pools Overview',
    POOLS_LIST_HEADER_BUTTON: 'New position',
    POOLS_LIST_FAV_TITLE: 'Favorite pools',
    POOLS_LIST_FILTER_PLACEHOLDER: 'Searching…',
    POOLS_LIST_TABLE_PAIR: 'Pair',
    POOLS_LIST_TABLE_LP_TOKENS: 'LP tokens',
    POOLS_LIST_TABLE_LEFT_TOKEN: 'Left token',
    POOLS_LIST_TABLE_RIGHT_TOKEN: 'Right token',
    POOLS_LIST_TOTAL_BALANCE_TITLE: 'Total balance, {name}',
    POOLS_LIST_TOTAL_APPORTIONMENT: 'Total apportionment',
    POOLS_LIST_TOTAL_COMMISSION_REWARD: 'Total commission reward',
    POOLS_LIST_BURN_BUTTON: 'Burn Liquidity',
    POOLS_LIST_ADD_BUTTON: 'Add liquidity',
    POOLS_LIST_WALLET_BALANCE: 'Wallet balance',
    POOLS_LIST_AMOUNT: 'Amount, {name}',
    POOLS_LIST_APPORTIONMENT: 'Apportionment',
    POOLS_LIST_NOTHING_FOUND: 'Nothing found',
    POOLS_LIST_EMPTY_TABLE: 'Favorite pools will be displayed here',
    POOLS_LIST_TOKEN_BALANCE: '{value} {symbol}',
    POOLS_FARMINGS_TITLE: 'Farming pools',

    POOLS_LIST_ITEM_NOT_FOUND: 'Pool not found',
    POOLS_LIST_ITEM_TITLE: '{symbol} Liquidity pool',
    POOLS_LIST_ITEM_OVERVIEW: 'Pools overview',

    POOL_HEADER_TITLE: 'Add Liquidity',
    POOL_FIELD_TOKEN_WALLET_BALANCE: 'Balance: {balance}',
    POOL_FIELD_LABEL_LEFT: 'Left',
    POOL_FIELD_LABEL_RIGHT: 'Right',
    POOL_FIELD_BTN_TEXT_SELECT_TOKEN: 'Select a token',
    POOL_AUTO_EXCHANGE_TEXT: '<p>Enable auto exchange</p><p>In this case, <b>{leftSymbol}</b> will be automatically exchanged for <b>{rightSymbol}</b> for the missing amount to compensate for the difference.</p>',
    POOL_STEP_NOTE_LEAD_INIT: 'Initializing...',
    POOL_STEP_NOTE_LEAD_CHECK_ACCOUNT: 'Checking account...',
    POOL_STEP_NOTE_LEAD_CHECK_PAIR: 'Checking pool...',
    POOL_STEP_NOTE_LEAD_CONNECT_ACCOUNT: 'Account not connected',
    POOL_STEP_NOTE_LEAD_CONNECTING_ACCOUNT: 'Connecting account...',
    POOL_STEP_NOTE_LEAD_POOL_NOT_EXIST: 'Pool doesn’t exist',
    POOL_STEP_NOTE_LEAD_POOL_NOT_CONNECTED: 'Pool not connected',
    POOL_STEP_NOTE_LEAD_POOL_CONNECTING: 'Pool connecting...',
    POOL_STEP_NOTE_LEAD_POOL_CREATING: 'Creating pool...',
    POOL_STEP_NOTE_LEAD_AWAIT_TRANSACTION: 'Await transaction...',
    POOL_STEP_NOTE_LEAD_SUPPLYING: 'Supplying...',
    POOL_STEP_NOTE_TEXT_CONNECT_ACCOUNT: 'You need to connect account, before you can continue. Account connection for this wallet occurs only once. You will not need to go through this procedure in the future.',
    POOL_STEP_NOTE_TEXT_CONNECTING_ACCOUNT: 'You need to connect account, before you can continue. Account connection for this wallet occurs only once. You will not need to go through this procedure in the future.',
    POOL_STEP_NOTE_TEXT_SELECT_TOKEN: 'You need to select left and right pair token, before you can continue.',
    POOL_STEP_NOTE_TEXT_CREATE_POOL: 'You need to create pool, before you can to continue.',
    POOL_STEP_NOTE_TEXT_CONNECT_POOL: 'You need to connect this pool to your dex account, before you can to continue.',
    POOL_BTN_TEXT_INIT: 'Initializing',
    POOL_BTN_TEXT_CHECK_ACCOUNT: 'Checking...',
    POOL_BTN_TEXT_CONNECT_ACCOUNT: 'Connect account',
    POOL_BTN_TEXT_CONNECTING_ACCOUNT: 'Connecting...',
    POOL_BTN_TEXT_SELECT_PAIR: 'Select tokens',
    POOL_BTN_TEXT_ENTER_AN_AMOUNT: 'Enter an amount',
    POOL_BTN_TEXT_CHECK_PAIR: 'Checking pool...',
    POOL_BTN_TEXT_CREATE_POOL: 'Create pool',
    POOL_BTN_TEXT_CONNECT_POOL: 'Connect pool',
    POOL_BTN_TEXT_CREATING_POOL: 'Creating...',
    POOL_BTN_TEXT_CONNECTING_POOL: 'Connecting...',
    POOL_BTN_TEXT_DEPOSIT_TOKEN: 'Deposit {symbol}',
    POOL_BTN_TEXT_SUPPLY: 'Supply',
    POOL_BTN_TEXT_SUBMIT: 'Submit',
    POOL_DATA_SUBTITLE_DEX_ACCOUNT: 'TON Swap account balance',
    POOL_DEX_DATA_LABEL_LP_TOKENS: 'LP Tokens',
    POOL_DEX_DATA_LABEL_CURRENT_SHARE: 'Current share',
    POOL_DEX_DATA_RESULT_CURRENT_SHARE: '{value}%',
    POOL_DEX_DATA_RESULT_CURRENT_SHARE_LEFT: '{value} {symbol}',
    POOL_DEX_DATA_RESULT_CURRENT_SHARE_RIGHT: '{value} {symbol}',
    POOL_ROOTS_INFO_LABEL_DEX_ADDRESS: 'TON Swap account address',
    POOL_ROOTS_INFO_LABEL_LP_ROOT: 'LP Root address',
    POOL_ROOTS_INFO_LABEL_PAIR_ROOT: 'Pool address',
    POOL_DATA_SUBTITLE_CURRENT_STATE: 'Pool data',
    POOL_DATA_LABEL_LP_SUPPLY: 'LP Supply',
    POOL_DATA_LABEL_LEFT_PRICE: '{leftSymbol} per {rightSymbol}',
    POOL_DATA_LABEL_RIGHT_PRICE: '{rightSymbol} per {leftSymbol}',
    POOL_DATA_LABEL_FEE: 'Fee',
    POOL_DATA_SUBTITLE_AFTER_SUPPLY: 'After supply',
    POOL_DATA_LABEL_SHARE_PERCENT: 'Share',
    POOL_DATA_RESULT_SHARE_PERCENT: '{value}%',
    POOL_DATA_LABEL_SHARE_CHANGE_PERCENT: 'Share change',
    POOL_DATA_RESULT_SHARE_CHANGE_PERCENT: '+ {value}%',
    POOL_DATA_LABEL_NEW_LEFT_PRICE: '{leftSymbol} per {rightSymbol}',
    POOL_DATA_LABEL_NEW_RIGHT_PRICE: '{rightSymbol} per {leftSymbol}',
    POOL_SUPPLY_RECEIPT_POPUP_TITLE: 'Supply receipt',
    POOL_SUPPLY_RECEIPT_LEAD_SUCCESSFUL_AMOUNT: '+ <span>{value}</span> LP',
    POOL_SUPPLY_RECEIPT_SUBTITLE_RESULT: 'Supply result',
    POOL_SUPPLY_RECEIPT_DATA_LABEL_SHARE_PERCENT: 'Share',
    POOL_SUPPLY_RECEIPT_DATA_RESULT_SHARE_PERCENT: '{value}%',
    POOL_SUPPLY_RECEIPT_DATA_LABEL_SHARE_CHANGE_PERCENT: 'Share change',
    POOL_SUPPLY_RECEIPT_DATA_RESULT_SHARE_CHANGE_PERCENT: '+ {value}%',
    POOL_SUPPLY_RECEIPT_DATA_LABEL_NEW_LEFT_PRICE: '{leftSymbol} per {rightSymbol}',
    POOL_SUPPLY_RECEIPT_DATA_LABEL_NEW_RIGHT_PRICE: '{rightSymbol} per {leftSymbol}',
    POOL_SUPPLY_RECEIPT_SUCCESSFUL_NOTE: '<p>Supply completed successfully.</p><p>LP token root <a href="https://ton-explorer.com/accounts/{address}" target="_blank" rel="nofollow noopener noreferrer">contract</a>.</p><p>You can view the result transaction in the <a href="https://ton-explorer.com/transactions/{transactionHash}" target="_blank" rel="nofollow noopener noreferrer">explorer</a>.</p>',
    POOL_SUPPLY_RECEIPT_LEAD_CANCELLED: 'Supply cancelled',
    POOL_SUPPLY_RECEIPT_CANCELLED_NOTE: '<p>The Supply was canceled. Your balance hasn’t changed.</p>',
    POOL_SUPPLY_RECEIPT_POPUP_BTN_TEXT_CLOSE: 'Close',

    FARMING_HEADER_TITLE: 'Farming',
    FARMING_HEADER_CREATE_LINK_TEXT: 'Create farm pool',
    FARMING_HEADER_GUIDE_LINK_TEXT: 'Guide',
    FARMING_LIST_HEADER_TOKEN_CELL: 'Token',
    FARMING_LIST_HEADER_TVL_CELL: 'TVL',
    FARMING_LIST_HEADER_APY_CELL: 'APY',
    FARMING_LIST_HEADER_REWARD_CELL: 'Reward',
    FARMING_LIST_HEADER_SHARE_CELL: 'Share',
    FARMING_LIST_HEADER_POOL_CELL: 'Pool',
    FARMING_LIST_POOL_STATUS_EXPIRED: 'Expired',
    FARMING_LIST_POOL_STATUS_ACTIVE: 'Active',
    FARMING_LIST_POOL_STATUS_AWAITING: 'Awaiting',
    FARMING_LIST_POOL_DETAILS_HEADER_TITLE: 'Farm pool {symbol}',
    FARMING_LIST_POOL_DETAILS_HEADER_SUBTITLE: 'Pool data',
    FARMING_LIST_POOL_DETAILS_FARM_BALANCE: 'Farm balance, {symbol}',
    FARMING_LIST_POOL_DETAILS_FARM_SPEED: 'Farm speed {symbol}/sec',
    FARMING_LIST_POOL_DETAILS_REWARD_BALANCE: 'Reward balance, {symbol}',
    FARMING_LIST_POOL_DETAILS_FARM_START: 'Farm start',
    FARMING_LIST_POOL_DETAILS_FARM_END: 'Farm end',
    FARMING_LIST_POOL_DETAILS_VESTING_RATIO: 'Vesting ratio, percent',
    FARMING_LIST_POOL_DETAILS_VESTING_PERIOD: 'Vesting period, days',
    FARMING_LIST_POOL_DETAILS_POOL_ADDRESS: 'Pool address',
    FARMING_LIST_POOL_DETAILS_OWNER_ADDRESS: 'Owner address',
    FARMING_LIST_POOL_DETAILS_FARM_TOKEN_ROOT: 'Farm token root',
    FARMING_LIST_POOL_DETAILS_REWARD_TOKEN: 'Reward token root, {symbol}',
    FARMING_POOL_FORM_WALLET_BALANCE_TEXT: 'Your wallet balance {balance} {symbol}',
    FARMING_POOL_FORM_DEPOSIT_AMOUNT_PLACEHOLDER: 'Amount...',
    FARMING_POOL_FORM_MAX_AMOUNT_DEPOSIT_BTN_TEXT: 'Max',
    FARMING_POOL_FORM_DEPOSIT_BTN_TEXT: 'Deposit',
    FARMING_POOL_FORM_DEPOSITING_BTN_TEXT: 'Depositing',
    FARMING_POOL_FORM_CREATE_PERIOD_START: 'Start time, YYYY/MM/DD HH:MM',
    FARMING_POOL_FORM_CREATE_PERIOD_RPS: 'Reward per second, {symbol}...',
    FARMING_POOL_FORM_SET_END_TIME: 'Close time, YYYY/MM/DD HH:MM',
    FARMING_POOL_FORM_CREATE_PERIOD: 'Create period',
    FARMING_POOL_FORM_CLOSE_POOL: 'Close pool',
    FARMING_POOL_FORM_CLAIM_BTN_TEXT: 'Claim',
    FARMING_POOL_FORM_WITHDRAW_BTN_TEXT: 'Withdraw',
    FARMING_POOL_FORM_DEPOSIT_TOKEN_BTN_TEXT: 'Deposit {symbol}',
    FARMING_POOL_FORM_DEPOSITING_TOKEN_BTN_TEXT: 'Depositing {symbol}',
    FARMING_POOL_FORM_TOKEN_WALLET_BALANCE_TEXT: 'Your {symbol} wallet balance: {amount} {symbol}',
    FARMING_POOL_FORM_ADMIN_TEXT: 'You are the pool administrator. You have access to the functions of deposit and withdrawal of unclaimed balance.',
    FARMING_POOL_FORM_WITHDRAW_UNCLAIMED_BTN_TEXT: 'Withdraw all',
    FARMING_LIST_USER_DETAILS_HEADER_SUBTITLE: 'User data',
    FARMING_LIST_USER_DETAILS_FARM_USER_BALANCE: 'Farm balance, {symbol}',
    FARMING_LIST_USER_DETAILS_FARM_USER_UNCLAIMED_REWARD: 'Unclaimed reward, {symbol}',
    FARMING_LIST_USER_DETAILS_FARM_USER_UNCLAIMED_REWARD_ENTITLED: 'Entitled reward, {symbol}',
    FARMING_LIST_USER_DETAILS_FARM_USER_UNCLAIMED_REWARD_DEBT: 'Reward debt, {symbol}',
    FARMING_LIST_USER_DETAILS_FARM_USER_UNCLAIMED_VESTING_TIME: 'Vesting before',
    FARMING_LIST_USER_DETAILS_FARM_CONTRACT_ADDRESS: 'Farm contract address',
    FARMING_CREATE_HEADER_TITLE: 'Create farm pool',
    FARMING_CREATE_FIELD_FARM_TOKEN_ROOT_LABEL: 'Farm token root',
    FARMING_CREATE_FIELD_FARM_TOKEN_ROOT_HINT: 'Address',
    FARMING_CREATE_FIELD_FARM_START_LABEL: 'Farm start',
    FARMING_CREATE_FIELD_FARM_START_HINT: 'YYYY/MM/DD HH:MM',
    FARMING_CREATE_FIELD_FARM_END_LABEL: 'Farm end',
    FARMING_CREATE_FIELD_FARM_END_HINT: 'YYYY/MM/DD HH:MM',
    FARMING_CREATE_FIELD_FARM_VESTING_RATIO_LABEL: 'Vesting ratio',
    FARMING_CREATE_FIELD_FARM_VESTING_RATIO_HINT: 'Ratio, percent',
    FARMING_CREATE_FIELD_FARM_VESTING_PERIOD_LABEL: 'Vesting period',
    FARMING_CREATE_FIELD_FARM_VESTING_PERIOD_HINT: 'Period, seconds',
    FARMING_CREATE_FIELD_REWARD_TOKEN_ROOT_LABEL: 'Reward token root',
    FARMING_CREATE_FIELD_REWARD_TOKEN_ROOT_HINT: 'Address',
    FARMING_CREATE_FIELD_TOTAL_REWARD_LABEL: 'Reward per second',
    FARMING_CREATE_FIELD_TOTAL_REWARD_HINT: 'Reward',
    FARMING_CREATE_FIELD_TOKEN_TOTAL_REWARD_HINT: '{symbol} per second',
    FARMING_CREATE_ADD_REWARD_TOKEN_LINK_TEXT: 'Add reward token',
    FARMING_CREATE_POOL_SUBTITLE_PARAMS: 'Farm pool params',
    FARMING_CREATE_POOL_PARAMS_FARM_TOKEN: 'Farm token',
    FARMING_CREATE_POOL_PARAMS_FARM_START_LOCAL: 'Start (Local Time)',
    FARMING_CREATE_POOL_PARAMS_FARM_START_UTC: 'Start (UTC)',
    FARMING_CREATE_POOL_PARAMS_FARM_END_LOCAL: 'End (Local Time)',
    FARMING_CREATE_POOL_PARAMS_FARM_END_UTC: 'End (UTC)',
    FARMING_CREATE_POOL_PARAMS_FARM_PERIOD: 'Period length',
    FARMING_CREATE_POOL_PARAMS_FARM_PERIOD_VALUE: '{days, plural, =0 {0 days} one {# day} other {# days}}',
    FARMING_CREATE_POOL_PARAMS_REWARD_TOKEN: 'Reward token #{index}',
    FARMING_CREATE_POOL_PARAMS_REWARD_TOKEN_DAY: 'Month reward #{index}',
    FARMING_CREATE_POOL_PARAMS_REWARD_TOKEN_FARM_SPEED: 'Farm speed #{index}',
    FARMING_CREATE_POOL_PARAMS_REWARD_TOKEN_FARM_SPEED_VALUE: '{value} {symbol}/sec',
    FARMING_CREATE_POOL_PARAMS_REWARD_TOKEN_FARM_DEPOSIT: 'Deposit #{index}',
    FARMING_CREATE_POOL_PARAMS_REWARD_TOKEN_FARM_DEPOSIT_VALUE: '{value} {symbol}',
    FARMING_CREATE_POOL_VALID_STATE_CREATION_NOTE: 'Farm pool creation cost is 7 TON. Gas does not return.',
    FARMING_CREATE_POOL_VALID_STATE_DEPOSIT_NOTE: 'You need to deposit full amount of {tokensDeposits} to pool address before it becomes active.',
    FARMING_CREATE_BTN_TEXT_SUBMIT: 'Create pool',

    FARMING_LIST_TITLE: 'Farming pools',
    FARMING_LIST_TITLE_ALL: 'All pools',
    FARMING_LIST_TITLE_FAV: 'Favorite pools',
    FARMING_LIST_CREATE_BTN: 'Create farm pool',

    FARMING_TABLE_FARMING_POOL: 'Farming pool',
    FARMING_TABLE_REWARD: 'Reward',
    FARMING_TABLE_TVL: 'TVL',
    FARMING_TABLE_TVL_CHANGE: 'TVL change',
    FARMING_TABLE_APR: 'APR',
    FARMING_TABLE_APR_CHANGE: 'APR change',
    FARMING_TABLE_SHARE: 'Share',
    FARMING_TABLE_YOUR_REWARD: 'Your reward',
    FARMING_TABLE_ENTITLED_REWARD: 'Entitled reward',
    FARMING_TABLE_DATE: 'Date',
    FARMING_TABLE_NOT_FOUND: 'No farming pools found',
    FARMING_TABLE_REWARDS_TITLE: 'Reward tokens',
    FARMING_TABLE_APR_VALUE: '{value}%',
    FARMING_TABLE_SHARE_VALUE: '{value}%',
    FARMING_TABLE_NULL: 'N/A',

    FARMING_DATE_WAITING: 'Starts {date}',
    FARMING_DATE_ACTIVE: 'Ends {date}',
    FARMING_DATE_INFINITE: 'Started',
    FARMING_DATE_ENDED: 'Ended',

    FARMING_PAIR_WAITING_TOOLTIP: '<h4>Waiting for the start of farming</h4><p>The farming period has not yet begun in<br />this pool.</p>',
    FARMING_PAIR_PUBLIC_TOOLTIP: '<h4>Your farming pool is visible to everyone</h4>',
    FARMING_PAIR_PRIVATE_TOOLTIP: '<h4>Only you see your farming pool</h4><p>Deposit the reward amount to the pool<br />balance to make it publicly visible</p>',
    FARMING_PAIR_WARNING_TOOLTIP: '<h4>Warning!</h4><p>Low reward balance, we do not<br />recommend investing in this pool</p>',

    FARMING_FILTER_FORM_BUTTON: 'Filter',
    FARMING_FILTER_FORM_INPUT: 'Search...',

    FARMING_ITEM_BREADCRUMB_LIST: 'All farming pools',
    FARMING_ITEM_BREADCRUMB_ITEM: '{symbol} farming pool',
    FARMING_ITEM_NOT_FOUND: 'Farming pool not found',
    FARMING_ITEM_TITLE: '{symbol} farming pool',
    FARMING_ITEM_BALANCE_TITLE: 'Farming balance',
    FARMING_ITEM_MANAGEMENT_TITLE: 'Pool management',
    FARMING_ITEM_USER_INFO_TITLE: 'My farming performance',
    FARMING_ITEM_BASE_INFO_TITLE: 'Farming pool statistics',
    FARMING_ITEM_DETAILS_TITLE: 'Details',
    FARMING_ITEM_SPEED_TITLE: 'Farming speed changes',
    FARMING_ITEM_TRANSACTIONS_TITLE: 'Transactions',

    FARMING_MESSAGE_GET_LP_TITLE: 'You don’t have the required LP tokens. Get them now to start farming at {apr}% APR',
    FARMING_MESSAGE_GET_LP_ACCEPTS: 'This pool accepts {symbol} tokens.',
    FARMING_MESSAGE_GET_LP_DEPOSIT: 'Deposit your {left} and {right} to the liquidity pool and get LP tokens to start farming.',
    FARMING_MESSAGE_GET_LP_GUIDE: 'See guide',
    FARMING_MESSAGE_GET_LP_GET: 'Get LP tokens',
    FARMING_MESSAGE_FARM_ENDED_TITLE: 'Farm pool ended. We recommend to withdraw all you LP and reward tokens.',
    FARMING_MESSAGE_LOW_BALANCE_TITLE: 'The farming pool reward balance is too low. We don’t recommend investing in this pool now. Check the pool later.',
    FARMING_MESSAGE_ADMIN_LOW_BALANCE_TITLE: 'This farm pool is checked as danger one. Deposit reward tokens to the farming pool balance',
    FARMING_MESSAGE_ADMIN_LOW_BALANCE_TEXT: 'Top up your farming pool balance otherwise the holders won’t able to get their own rewards.',
    FARMING_MESSAGE_ADMIN_LOW_BALANCE_BTN: 'Deposit reward tokens',
    FARMING_MESSAGE_ADMIN_NULL_BALANCE_TITLE: 'Insufficient balance',
    FARMING_MESSAGE_ADMIN_NULL_BALANCE_TEXT: 'Your farm is accumulating debt due to the low balance of reward tokens.<br />Top up the farm balance to pay the debt or close the pool to prevent deficit growth.',
    FARMING_MESSAGE_ADMIN_NULL_BALANCE_BTN: 'Deposit reward tokens',

    FARMING_BALANCE_DEPOSIT_TITLE: 'Deposit',
    FARMING_BALANCE_DEPOSIT_TEXT: 'Deposit your LP tokens to start farming',
    FARMING_BALANCE_DEPOSIT_ACTION: 'Deposit',
    FARMING_BALANCE_DEPOSIT_BALANCE: 'Your wallet balance: {value} {symbol}',
    FARMING_BALANCE_WITHDRAW_TITLE: 'Withdraw',
    FARMING_BALANCE_WITHDRAW_CLAIM_TAB: 'Claim reward',
    FARMING_BALANCE_WITHDRAW_WITHDRAW_TAB: 'Withdraw LP tokens',
    FARMING_BALANCE_WITHDRAW_ACTION_CLAIM: 'Claim',
    FARMING_BALANCE_WITHDRAW_ACTION_WITHDRAW: 'Withdraw',
    FARMING_BALANCE_WITHDRAW_BALANCE: 'Your farming balance: {value} {symbol}',
    FARMING_BALANCE_TOKEN: '{amount} {symbol}',

    FARMING_ADMIN_DEPOSIT_REQUIRED_BALANCE: 'Deposited: <b>{amount} {symbol}</b> / {required} {symbol}',
    FARMING_ADMIN_DEPOSIT_BALANCE: 'Deposited: {amount} {symbol}',
    FARMING_ADMIN_DEPOSIT_TITLE: 'Deposit reward tokens',
    FARMING_ADMIN_DEPOSIT_TEXT: 'Tokens that will be rewarded to LP token holders.',
    FARMING_ADMIN_DEPOSIT_WARNING_TITLE: 'Amount of deposited reward tokens is not enough',
    FARMING_ADMIN_DEPOSIT_WARNING_TEXT: 'Only you see this farming pool. Deposit reward tokens to this farming pool to launch farming and make it public for all.',
    FARMING_ADMIN_DEPOSIT_ACTION: 'Deposit',
    FARMING_ADMIN_DEPOSIT_HINT: 'Your wallet balance: {amount} {symbol}',

    FARMING_ADMIN_WITHDRAW_TITLE: 'Withdraw reward tokens',
    FARMING_ADMIN_WITHDRAW_TEXT: 'You will be able to withdraw unused part of reward tokens after vesting and lock periods are over',
    FARMING_ADMIN_WITHDRAW_BTN: 'Withdraw',
    FARMING_ADMIN_WITHDRAW_TOKENS_TITLE: 'Available balance',

    FARMING_CONFIG_TITLE: 'Farm configuration',
    FARMING_CONFIG_TAB_SPEED: 'Speed',
    FARMING_CONFIG_TAB_END_TIME: 'Danger zone',
    FARMING_CONFIG_REWARD_AMOUNT_LABEL: 'Reward amount, {symbol}/sec',
    FARMING_CONFIG_REWARD_AMOUNT_PLACEHOLDER: 'Amount...',
    FARMING_CONFIG_START_LABEL: 'Farming start',
    FARMING_CONFIG_DATE_PLACEHOLDER: 'YYYY.MM.DD',
    FARMING_CONFIG_TIME_PLACEHOLDER: 'HH:MM',
    FARMING_CONFIG_SAVE_CHANGES: 'Save changes',
    FARMING_CONFIG_END_LABEL: 'Farming end',
    FARMING_CONFIG_CLOSE_POOL: 'Close pool',
    FARMING_CONFIG_CONFIRMATION_TITLE: 'Are you sure?',
    FARMING_CONFIG_CONFIRMATION_TEXT: '⚠️ Farm pool closing is irreversible. Do this with caution.',
    FARMING_CONFIG_CONFIRMATION_YES: 'Yes, close pool',
    FARMING_CONFIG_CONFIRMATION_NO: 'No, cancel',

    FARMING_BASE_INFO_TVL: 'TVL',
    FARMING_BASE_INFO_TOKENS: 'LP breakdown, tokens',
    FARMING_BASE_INFO_LP_TOKENS: 'LP token, {symbol}',
    FARMING_BASE_INFO_APR: 'APR',
    FARMING_BASE_INFO_APR_VALUE: '{value}%',
    FARMING_BASE_INFO_REWARD: 'Remaining reward balance',
    FARMING_BASE_INFO_SPEED: 'Farming speed, sec',
    FARMING_BASE_INFO_NULL: 'N/A',

    FARMING_USER_INFO_FARMING_BALANCE: 'Farming balance',
    FARMING_USER_INFO_TOKENS: 'LP breakdown, tokens',
    FARMING_USER_INFO_LP_TOKENS: 'LP token, {symbol}',
    FARMING_USER_INFO_ENTITLED_TITLE: 'Entitled reward',
    FARMING_USER_INFO_UNCLAIMED_TITLE: 'Unclaimed reward',
    FARMING_USER_INFO_DEBT_TITLE: 'Farm debt',
    FARMING_USER_INFO_SHARE: 'Share in farming pool',
    FARMING_USER_INFO_SHARE_VALUE: '{value}%',
    FARMING_USER_INFO_NULL: 'N/A',

    FARMING_ADDRESSES_TITLE: 'Addresses',
    FARMING_ADDRESSES_POOL: 'Farming pool contract address',
    FARMING_ADDRESSES_OWNER: 'Owner address',
    FARMING_ADDRESSES_USER: 'My farming address',
    FARMING_ADDRESSES_TOKEN_ROOT: 'Farming token root',
    FARMING_ADDRESSES_TOKEN: 'Reward token root, {symbol}',

    FARMING_VESTING_TITLE: 'Vesting',
    FARMING_VESTING_RATIO_TITLE: 'Vesting ratio',
    FARMING_VESTING_RATIO_VALUE: '{value}%',
    FARMING_VESTING_PERIOD_TITLE: 'Vesting period',
    FARMING_VESTING_PERIOD_VALUE: '{days, plural, =0 {0 days} one {# day} other {# days}}',
    FARMING_VESTING_VESTING_UNTIL: 'Current vesting until, UTC',
    FARMING_VESTING_NULL: '—',

    FARMING_CHART_TAB_TVL: 'TVL',
    FARMING_CHART_TAB_APR: 'APR',
    FARMING_CHART_TIMEFRAME_H1: '1H',
    FARMING_CHART_TIMEFRAME_D1: '1D',
    FARMING_CHART_NO_DATA: 'No data for the graph',

    FARMING_FILTER_TITLE: 'Filter',
    FARMING_FILTER_PAIR: 'Pair',
    FARMING_FILTER_STATES: 'Pool states',
    FARMING_FILTER_AWAITING: 'Awaiting start',
    FARMING_FILTER_ACTIVE: 'Active',
    FARMING_FILTER_UNACTIVE: 'Unactive',
    FARMING_FILTER_MY_FARMING: 'My farming',
    FARMING_FILTER_WITH_MY_FARMING: 'With my farming',
    FARMING_FILTER_WITHOUT_MY_FARMING: 'Without my farming',
    FARMING_FILTER_POOL_BALANCE: 'Pool balance',
    FARMING_FILTER_WITH_LOW_BALANCE: 'With low balance',
    FARMING_FILTER_TVL: 'TVL, $',
    FARMING_FILTER_FROM: 'From',
    FARMING_FILTER_TO: 'To',
    FARMING_FILTER_APY: 'APY, %',
    FARMING_FILTER_CLEAR: 'Clear',
    FARMING_FILTER_APPLY: 'Apply',

    FARMING_SPEED_TITLE: 'Farming speed, sec',
    FARMING_SPEED_START_TITLE: 'Start, UTC',
    FARMING_SPEED_END_TITLE: 'End, UTC',

    FARMING_TRANSACTIONS_TAB_ALL: 'All',
    FARMING_TRANSACTIONS_TAB_CLAIMS: 'Claims',
    FARMING_TRANSACTIONS_TAB_DEPOSITS: 'Deposits',
    FARMING_TRANSACTIONS_TAB_WITHDRAW: 'Withdraw',
    FARMING_TRANSACTIONS_TAB_REWARD: 'Reward deposit',
    FARMING_TRANSACTIONS_COL_TRANSACTION: 'Transaction',
    FARMING_TRANSACTIONS_COL_VALUE: 'Total value',
    FARMING_TRANSACTIONS_COL_ACCOUNT: 'Account',
    FARMING_TRANSACTIONS_COL_TIME: 'Time',
    FARMING_TRANSACTIONS_COL_TOKEN: 'Token',

    FARMING_TOKEN: '{amount} {symbol}',

    AMOUNT_INPUT_MAX: 'Max',
    AMOUNT_INPUT_PLACEHOLDER: 'Amount...',

    CURRENCIES_HEADER_TITLE: 'All tokens',
    CURRENCIES_WATCHLIST_HEADER_TITLE: 'My tokens watchlist',
    CURRENCIES_LIST_HEADER_NAME_CELL: 'Name',
    CURRENCIES_LIST_HEADER_PRICE_CELL: 'Price',
    CURRENCIES_LIST_HEADER_PRICE_CHANGE_CELL: 'Price change',
    CURRENCIES_LIST_HEADER_VOLUME24_CELL: 'Volume 24H',
    CURRENCIES_LIST_HEADER_TVL_CELL: 'TVL',
    CURRENCY_BREADCRUMB_ROOT: 'Tokens',
    CURRENCY_ADD_LIQUIDITY_BTN_TEXT: 'Add Liquidity',
    CURRENCY_TRADE_BTN_TEXT: 'Trade',
    CURRENCY_STATS_TVL_TERM: 'TVL',
    CURRENCY_STATS_VOLUME24_TERM: '24h Trading Volume',
    CURRENCY_STATS_VOLUME7_TERM: '7d Trading Volume',
    CURRENCY_STATS_TRANSACTIONS24_TERM: '24h Transactions',
    CURRENCY_GRAPH_TAB_PRICES: 'Prices',
    CURRENCY_GRAPH_TAB_VOLUME: 'Volume',
    CURRENCY_GRAPH_TAB_TVL: 'TVL',
    CURRENCY_PAIRS_LIST_HEADER_TITLE: 'Pairs',
    CURRENCY_TRANSACTIONS_LIST_HEADER_TITLE: 'Transactions',

    PAIRS_HEADER_TITLE: 'All pairs',
    PAIRS_LIST_HEADER_PAIR_CELL: 'Pair',
    PAIRS_LIST_HEADER_VOLUME24_CELL: 'Volume 24H',
    PAIRS_LIST_HEADER_VOLUME7_CELL: 'Volume 7D',
    PAIRS_LIST_HEADER_TVL_CELL: 'TVL',
    PAIR_BREADCRUMB_ROOT: 'Pairs',
    PAIR_TOKEN_PRICE: '1 {symbolLeft} = {amount} {symbolRight}',
    PAIR_ADD_LIQUIDITY_BTN_TEXT: 'Add Liquidity',
    PAIR_TRADE_BTN_TEXT: 'Trade',
    PAIR_STATS_TTL_TERM: 'Total Tokens Locked',
    PAIR_STATS_TVL_TERM: 'TVL',
    PAIR_STATS_VOLUME24_TERM: '24h Trading Volume',
    PAIR_STATS_FEES24_TERM: '24h Fees',
    PAIR_GRAPH_TAB_VOLUME: 'Volume',
    PAIR_GRAPH_TAB_TVL: 'Liquidity',
    PAIR_TRANSACTIONS_LIST_HEADER_TITLE: 'Transactions',

    BUILDER_HEADER_TITLE: 'Builder',
    BUILDER_HEADER_CREATE_LINK_TEXT: 'Create new token',
    BUILDER_LIST_HEADER_NAME_CELL: 'Name',
    BUILDER_LIST_HEADER_SYMBOL_CELL: 'Symbol',
    BUILDER_LIST_HEADER_DECIMALS_CELL: 'Decimals',
    BUILDER_LIST_HEADER_TOTAL_SUPPLY_CELL: 'Total supply',
    BUILDER_LIST_HEADER_TOTAL_ROOT_CELL: 'Root',
    BUILDER_CREATE_HEADER_TITLE: 'Create token',
    BUILDER_CREATE_FIELD_LABEL_NAME: 'Name',
    BUILDER_CREATE_FIELD_LABEL_SYMBOL: 'Symbol',
    BUILDER_CREATE_FIELD_LABEL_DECIMALS: 'Decimals',
    BUILDER_CREATE_FIELD_PLACEHOLDER_NAME: 'Name your token',
    BUILDER_CREATE_FIELD_PLACEHOLDER_SYMBOL: 'Add token symbol',
    BUILDER_CREATE_FIELD_PLACEHOLDER_DECIMALS: 'Set token decimals',
    BUILDER_CREATE_BTN_TEXT_SUBMIT: 'Build',
    BUILDER_CREATE_BTN_TEXT_ENTER_ALL_DATA: 'Enter all data',
    BUILDER_CREATE_TRANSACTION_RECEIPT_POPUP_TITLE: 'Token receipt',
    BUILDER_CREATE_TRANSACTION_RECEIPT_TOKEN_DEPLOYED: 'Token deployed',
    BUILDER_CREATE_TRANSACTION_RECEIPT_SUCCESSFUL_NOTE: '<p>Token {name} deployed successfully.</p><p>{symbol} token root <a href="https://ton-explorer.com/accounts/{address}" target="_blank" rel="nofollow noopener noreferrer">contract</a>.</p><p>You can view the result transaction in the <a href="https://ton-explorer.com/transactions/{transactionHash}" target="_blank" rel="nofollow noopener noreferrer">explorer</a>.</p>',
    BUILDER_CREATE_TRANSACTION_RECEIPT_TOKEN_NOT_DEPLOYED: 'Token not deployed',
    BUILDER_CREATE_TRANSACTION_RECEIPT_BTN_TEXT_CLOSE: 'Close',
    BUILDER_SEARCH_FIELD_PLACEHOLDER: 'Filtering...',
    BUILDER_MESSAGE_TOKEN_NOT_FOUND: 'Token not found',
    BUILDER_MESSAGE_NO_TOKEN: 'You don’t have any token',
    BUILDER_BUTTON_CREATE_TOKEN: 'Create new one',
    BUILDER_MANAGE_TOKEN_HEADER_TITLE: 'Manage token',
    BUILDER_MANAGE_TOKEN_DESCRIPTION_TEXT: 'Description',
    BUILDER_MANAGE_TOKEN_ACTIONS_TEXT: 'Actions',
    BUILDER_MANAGE_TOKEN_CIRCULATING_SUPPLY_TITLE: 'Manage circulating supply',
    BUILDER_MANAGE_TOKEN_MINT_NAME: 'Mint',
    BUILDER_MANAGE_TOKEN_MINT_DESCRIPTION: 'Issue additional tokens to a specific address',
    BUILDER_MANAGE_TOKEN_BURN_NAME: 'Burn',
    BUILDER_MANAGE_TOKEN_BURN_DESCRIPTION: 'Destroy tokens at a specific address',
    BUILDER_MANAGE_TOKEN_MINT_BTN_TEXT: 'Mint',
    BUILDER_MANAGE_TOKEN_DANGER_ZONE_TITLE: 'Danger zone',
    BUILDER_MANAGE_TOKEN_TRANSFER_OWNERSHIP_NAME: 'Transfer ownership',
    BUILDER_MANAGE_TOKEN_TRANSFER_OWNERSHIP_DESCRIPTION: 'Set a new token owner',
    BUILDER_MANAGE_TOKEN_TRANSFER_OWNERSHIP_BTN_TEXT: 'Transfer',
    BUILDER_MANAGE_TOKEN_BTN_TEXT_ENTER_ALL_DATA: 'Enter all data',
    BUILDER_MANAGE_TOKEN_MINT_POPUP_TITLE: 'Mint tokens',
    BUILDER_MANAGE_TOKEN_LABEL_TARGET_ADDRESS: 'Target address',
    BUILDER_MANAGE_TOKEN_MINT_LABEL_AMOUNT: 'Amount to mint',
    BUILDER_MANAGE_TOKEN_BURN_POPUP_TITLE: 'Burn tokens',
    BUILDER_MANAGE_TOKEN_BURN_LABEL_AMOUNT: 'Amount to burn',
    BUILDER_MANAGE_TOKEN_BURN_LABEL_CALLBACK_ADDRESS: 'Callback address',
    BUILDER_MANAGE_TOKEN_BURN_LABEL_CALLBACK_PAYLOAD: 'Callback payload',
    BUILDER_MANAGE_TOKEN_BURN_BTN_TEXT: 'Burn',
    BUILDER_MANAGE_TOKEN_TRANSFER_POPUP_TITLE: 'Transfer token ownership',
    BUILDER_MANAGE_TOKEN_TRANSFER_LABEL_NEW_OWNER: 'New owner address',
    BUILDER_MANAGE_TOKEN_LABEL_NETWORK: 'Network',
    BUILDER_MANAGE_TOKEN_LABEL_ROOT: 'Root',
    BUILDER_MANAGE_TOKEN_LABEL_TOKEN_NAME: 'Token name',
    BUILDER_MANAGE_TOKEN_LABEL_TOKEN_SYMBOL: 'Token symbol',
    BUILDER_MANAGE_TOKEN_LABEL_DECIMAL_PLACES: 'Decimal places',
    BUILDER_MANAGE_TOKEN_LABEL_TOTAL_SUPPLY: 'Total supply',
    BUILDER_MANAGE_TOKEN_MESSAGE_ENTER_ADDRESS: 'Enter target address',
    BUILDER_MANAGE_TOKEN_TITLE_BALANCE: 'Target address balance',
    BUILDER_MANAGE_TOKEN_LABEL_SUPPLY: 'Circulating supply',
    BUILDER_MANAGE_TOKEN_LABEL_CURRENT: 'Current',
    BUILDER_MANAGE_TOKEN_LABEL_AFTER_MINING: 'After mining',
    BUILDER_MANAGE_TOKEN_MESSAGE_ENTER_AMOUNT: 'Enter amount to mint',
    BUILDER_MANAGE_TOKEN_BTN_TEXT_SUBMIT: 'Confirm',
    BUILDER_MANAGE_TOKEN_BTN_TEXT_CANCEL: 'Cancel',
    BUILDER_MANAGE_TOKEN_MESSAGE_ENTER_VALID_ADDRESS: 'Enter valid target address',
    BUILDER_MANAGE_TOKEN_MESSAGE_INVALID_CALLBACK_ADDRESS: 'Invalid callback address',
    BUILDER_MANAGE_TOKEN_CONFIRMATION_MINT_TITLE: 'Waiting for minting',
    BUILDER_MANAGE_TOKEN_CONFIRMATION_MINT_DESCRIPTION: 'Minting tokens',
    BUILDER_MANAGE_TOKEN_CONFIRMATION_BURN_TITLE: 'Waiting for burning',
    BUILDER_MANAGE_TOKEN_CONFIRMATION_BURN_DESCRIPTION: 'Burning tokens',
    BUILDER_MANAGE_TOKEN_CONFIRMATION_TRANSFER_TITLE: 'Waiting for transfer',
    BUILDER_MANAGE_TOKEN_CONFIRMATION_TRANSFER_DESCRIPTION: 'Transfer is in progress',

    TRANSACTIONS_LIST_HEADER_TRANSACTION_CELL: 'Transaction',
    TRANSACTIONS_LIST_HEADER_TOTAL_VALUE_CELL: 'Total value',
    TRANSACTIONS_LIST_HEADER_LEFT_TOKEN_CELL: 'Left token',
    TRANSACTIONS_LIST_HEADER_RIGHT_TOKEN_CELL: 'Right token',
    TRANSACTIONS_LIST_HEADER_ACCOUNT_CELL: 'Account',
    TRANSACTIONS_LIST_HEADER_TIME_CELL: 'Time',
    TRANSACTION_EVENT_DEPOSIT: 'Add {leftSymbol} and {rightSymbol}',
    TRANSACTION_EVENT_WITHDRAW: 'Remove {leftSymbol} and {rightSymbol}',
    TRANSACTION_EVENT_SWAP_LEFT_TO_RIGHT: 'Swap {leftSymbol} to {rightSymbol}',
    TRANSACTION_EVENT_SWAP_RIGHT_TO_LEFT: 'Swap {rightSymbol} to {leftSymbol}',
    TRANSACTIONS_LIST_EVENT_ALL: 'All',
    TRANSACTIONS_LIST_EVENT_SWAPS: 'Swaps',
    TRANSACTIONS_LIST_EVENT_DEPOSIT: 'Adds',
    TRANSACTIONS_LIST_EVENT_WITHDRAW: 'Removes',
    TRANSACTIONS_LIST_NO_TRANSACTIONS: 'No transactions',
    TRANSACTIONS_LIST_NULL: 'N/A',
}
