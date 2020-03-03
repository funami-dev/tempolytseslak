<script>
  import { onMount } from "svelte";
  import { Button, Input, Modal } from "svelma";
  import randomEmoji from "random-emoji";

  import "bulma/css/bulma.css";
  import "@fortawesome/fontawesome-free/css/all.css";

  import { rollDice } from "./utils.js";
  import Chart from "chart.js";

  let settings = {
    length: 9,
    players: 6
  };

  let delay = 200;

  let gameDefaults = {
    running: false,
    round: 0,
    rounds: [],
    currentToss: [],
    winner: null,
    finished: false
  };

  let game = {
    running: false,
    round: 0,
    rounds: [],
    currentToss: [],
    winner: null,
    finished: false
  };

  let chartData = {
    labels: [],
    datasets: []
  };

  let showPatch = false;

  $: myChart = null;
  $: T = [];

  $: players = new Array(settings.players);
  $: length = new Array(settings.length);

  onMount(() => {
    prepareGame();
  });

  function startGame() {
    game.running = true;
    doRound();
  }

  function doRound() {
    ++game.round;
    rollDices();
    movePlayers();
    if (delay) {
      setTimeout(() => {
        checkWinner();
      }, delay);
    } else {
      checkWinner();
    }
  }

  function endGame() {
    game.running = false;
    showPatch = true;
    prepareDataForChart();
    createChart();
  }

  function random_rgba() {
    var o = Math.round,
      r = Math.random,
      s = 255;
    return `rgb(${o(r() * s)},${o(r() * s)},${o(r() * s)}, .5)`;
  }

  function saveRound() {
    game.rounds = [
      ...game.rounds,
      { round: game.round, winner: game.winner, s: { ...T } }
    ];
  }

  function checkWinner() {
    const winner = T.filter(el => el.p === settings.length - 1);
    console.log({ winner });

    if (Boolean(winner.length)) {
      game.finished = true;

      game = {
        ...game,
        winner: winner[0].char // TODO: winner.length > 1 ? winner.map(el => el.color) :
      };
      // console.log(winner[0].p);

      // game.winner = winner[0].p;

      saveRound();
      endGame();
    } else {
      saveRound();
      doRound();
    }
  }

  function resetGame() {
    myChart.destroy();
    chartData = {
      labels: [],
      datasets: []
    };

    prepareGame();

    game = gameDefaults;
    game.running = false;
    game.rounds = [];
  }

  function prepareGame() {
    const chars = randomEmoji.random({ count: settings.players });

    T = [];
    for (let index = 1; index <= settings.players; index++) {
      T = [
        ...T,
        { p: 0, color: random_rgba(), char: chars[index - 1].character }
      ];
    }
  }

  function prepareDataForChart() {
    chartData = {
      labels: [],
      datasets: []
    };
    chartData.labels = game.rounds.map(el => el.round);

    for (let index = 1; index <= settings.players; index++) {
      chartData.datasets = [
        ...chartData.datasets,
        {
          label: index,
          data: [],
          borderColor: T[index - 1].color,
          backgroundColor: "transparent"
          // backgroundColor: T[index - 1].color
        }
      ];
    }
    const borderColors = T.map(el => el.color);

    chartData.datasets.map(set => {
      set.data = [];
      game.rounds.map(el => {
        set.data = [...set.data, el.s[(set.label - 1).toString()].p];
      });
    });
    chartData.datasets.map(el => (el.label = T[el.label - 1].char));
  }

  function rollDices() {
    game.currentToss = [
      rollDice(1, settings.players),
      rollDice(1, settings.players)
    ];
  }

  function movePlayers() {
    const _T1 = T[game.currentToss[0] - 1];
    const _T2 = T[game.currentToss[1] - 1];
    T[game.currentToss[0] - 1] = { ..._T1, p: _T1.p + 1 };
    T[game.currentToss[1] - 1] = { ..._T2, p: _T2.p + 1 };
  }

  function createChart() {
    var ctx = window.document.getElementById("myChart");
    myChart = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        scales: {
          yAxes: [
            {
              stacked: false
            }
          ]
        }
      }
    });
  }
</script>

<style>
  .game {
    display: grid;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-content: stretch;
    align-items: flex-start;
  }
  .progress-line {
    width: 120px;
    align-self: center;
    justify-self: flex-start;
  }
  .player-line {
    width: 20px;
    align-self: center;
    justify-self: flex-start;
  }
  .info-line {
    width: 20px;
    align-self: center;
    justify-self: flex-start;
  }
  #myChart {
    background: #fff;
  }
</style>

<!-- Single Component??? 'r u NUTSSS??' -->
<div class="game">
  <section class="section">
    <div class="container">
      <h1 class="title">Settings</h1>
      <div class="field is-horizontal">
        <div class="field-body">
          <div class="field">
            <input
              class="input"
              type="text"
              disabled={game.running}
              on:blur={prepareGame}
              bind:value={settings.players} />
            <p class="help">Players</p>

          </div>
          <div class="field">
            <Input
              disabled
              class="input"
              type="text"
              on:blur={prepareGame}
              bind:value={settings.length} />
            <p class="help">Length (WIP)</p>
          </div>
          <div class="field">
            <input class="input" type="text" bind:value={delay} />
            <p class="help">Delay</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <p>
        current toss:
        {#each game.currentToss as toss}
          <span class="tag is-light">{toss}</span>
        {/each}
      </p>
      <p>
        current round:
        <span class="tag is-light">{game.rounds.length}</span>
      </p>
    </div>
    <div class="container">
      <Button
        type="is-primary"
        disabled={game.winner || game.running}
        on:click={startGame}>
        START
      </Button>
      <Button
        disabled={!game.winner || game.running}
        type="is-danger"
        on:click={resetGame}>
        RESET
      </Button>

      <!-- TODO: one button solution -->
      <!-- <Button
        disabled={game.running}
        type="is-info"
        on:click={Boolean(game.winner) === true ? resetGame : startGame}>
        {Boolean(game.winner) === false ? 'resetGame' : 'startGame'}
      </Button> -->
    </div>
    <div class="container">
      {#each T as player, index}
        <div
          class="row"
          style={`background-color: ${player.p === 0 || player.p < index ? player.color : player.color}`}>
          <div class="info-line">{index + 1}:{player.p}</div>
          <div class="progress-line">
            <!-- {player.p === 0 ? 'START' : 'RUNNING'} -->
            <progress
              class="progress is-link"
              value={player.p}
              max={settings.length - 1} />
          </div>
          {#each length as col, index}
            <div class="player-line">
              {player.p === 0 || player.p < index ? ' ' : player.char}
            </div>
          {/each}
        </div>
      {/each}

    </div>
  </section>
  <section class="section">
    <div>
      <canvas id="myChart" width="480" height="200" />
      {#if game.winner}
        <p>Winner: {game.winner}:</p>
        <Modal bind:active={showPatch}>
          <div
            style="text-align:center;background: url(winnersnail.svg) center;
            background-size: cover;width:621px;height:610px;">
            <p style="padding-top:102px;font-size:62px">{game.winner}</p>
          </div>
        </Modal>
      {/if}
    </div>
  </section>
  <section class="section">
    <div class="container">
      <h3>Whats next??</h3>
      <ul>
        <li>[ ] create sessionId and give every game a url</li>
        <li>
          [ ] Create big big data-trash ::: save all results to an mongo db
        </li>
        <li>[ ] Create overall statistics from data-trash</li>
        <li>[ ] calculate co^2 waste of this project</li>
        <li>[ ] Twitter-Account and automation</li>
        <li>[ ] pr for to make tks an epic e-sport</li>
        <li>[ ] online-bets!!! make mo money</li>
        <li>[ ] use money to travel to mars BEFORE Elon Musk!</li>
        <li>Project complete - Thanks</li>
      </ul>
      <h3>Known Issues</h3>
      <ul>
        <li>500 SSR INPUT Field</li>
      </ul>
      <h3>I used Stuff from</h3>
      <ul>
        <li>
          <a href="https://www.vecteezy.com/free-vector/snail">
            Snail Vectors by Vecteezy
          </a>
        </li>
      </ul>
    </div>
  </section>
</div>
