const visor = document.getElementById("visor");
let novaConta = false;
let podeContinuar = true;

function digitar(valor) {
  const substituiZero =
    valor === "." ||
    valor === "√" ||
    (valor >= "0" && valor <= "9");

  if (novaConta) {
    novaConta = false;
    if (substituiZero || !podeContinuar) {
      visor.textContent = "0";
      visor.classList.remove("mensagem");
    }
  }

  if (substituiZero && visor.textContent === "0") {
    visor.textContent = valor;
  } else {
    visor.textContent += valor;
  }
}

function arredondar(numero) {
  return parseFloat(numero.toFixed(10));
}

function mostrarMensagem(texto) {
  visor.textContent = texto;
  visor.classList.add("mensagem");
  podeContinuar = false;
}

function temDivisaoPorZero(conta) {
  const dividePorZero = /\/0(\.0*)?(?![\d.])/.test(conta);
  const zeroElevadoNegativo = /(^|[^\d.])0(\.0*)?\*\*-/.test(conta);
  return dividePorZero || zeroElevadoNegativo;
}

function raiz(numero, indice) {
  if (numero >= 0) {
    return Math.pow(numero, 1 / indice);
  }
  if (Number.isInteger(indice) && indice % 2 === 1) {
    return -Math.pow(-numero, 1 / indice);
  }
  throw new Error("Resultado complexo dentro de outra conta");
}

function formatarComplexo(real, imaginaria) {
  const parteImaginaria =
    (Math.abs(imaginaria) === 1 ? "" : Math.abs(imaginaria)) + "i";

  if (real === 0) {
    return (imaginaria < 0 ? "-" : "") + parteImaginaria;
  }
  return real + (imaginaria < 0 ? " - " : " + ") + parteImaginaria;
}

function raizComplexa(numero, indice) {
  const modulo = Math.pow(-numero, 1 / indice);
  const angulo = Math.PI / indice;

  const real = arredondar(modulo * Math.cos(angulo));
  const imaginaria = arredondar(modulo * Math.sin(angulo));

  return formatarComplexo(real, imaginaria);
}

function calcular() {
  const texto = visor.textContent;

  try {
    const raizNegativa = texto.match(/^(?:(\d+)ⁿ√|√)(-\d+\.?\d*)$/);

    if (raizNegativa) {
      const indice = raizNegativa[1] ? Number(raizNegativa[1]) : 2;
      const numero = Number(raizNegativa[2]);

      if (indice > 0 && indice % 2 === 0) {
        visor.textContent = raizComplexa(numero, indice);
        podeContinuar = false;
        novaConta = true;
        return;
      }
    }

    const conta = texto
      .replace(/(\d+\.?\d*)ⁿ√(-?\d+\.?\d*)/g, "raiz($2, $1)")
      .replace(/√(-?\d+\.?\d*)/g, "raiz($1, 2)")
      .replaceAll("%", "/100")
      .replaceAll("^", "**");

    const resultado = eval(conta);

    if (Number.isNaN(resultado)) {
      mostrarMensagem("Indeterminado");
    } else if (!isFinite(resultado)) {
      if (temDivisaoPorZero(conta)) {
        mostrarMensagem("Indefinido");
      } else {
        mostrarMensagem("Número muito grande");
      }
    } else {
      visor.textContent = arredondar(resultado);
      podeContinuar = true;
    }
  } catch (erro) {
    mostrarMensagem("Erro");
  }

  novaConta = true;
}

function limpar() {
  visor.textContent = "0";
  visor.classList.remove("mensagem");
  novaConta = false;
  podeContinuar = true;
}

document.querySelectorAll("[data-valor]").forEach(function (botao) {
  botao.addEventListener("click", function () {
    digitar(botao.dataset.valor);
  });
});

document.getElementById("btn-igual").addEventListener("click", calcular);
document.getElementById("btn-limpar").addEventListener("click", limpar);

// Registro do service worker (PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("sw.js")
      .then(function () {
        console.log("Service worker registrado!");
      })
      .catch(function (erro) {
        console.log("Erro ao registrar o service worker:", erro);
      });
  });
}