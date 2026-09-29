# Previsão do Tempo

App web que mostra o clima atual e a previsão de 5 dias para qualquer cidade.

**[Ver online](https://mpaulatech.github.io/weather-app/)**

![Print do app](https://github.com/user-attachments/assets/09b2430d-2208-49f9-bf0c-55631e181daa)

## Tecnologias
HTML, CSS, JavaScript e API Open-Meteo

## Funcionalidades
- Busca de cidades com sugestões em tempo real
- Seleção de cidade quando há resultados com o mesmo nome
- Clima atual (temperatura, sensação térmica, umidade e vento)
- Previsão de 5 dias
- Tratamento de erros

## Como rodar
Baixe o projeto e abra o `index.html` no navegador.

## Melhorias feitas após revisão
- Sugestões renderizadas com `textContent` em vez de `innerHTML`, evitando XSS
- Seleção de cidade quando há resultados homônimos, em vez de assumir o primeiro

## Sobre o desenvolvimento
Projeto desenvolvido com apoio do Cursor. Revisei e validei o código para entender cada parte.
