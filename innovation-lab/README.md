# Innovation Lab

Portal em português com seis demonstrações interativas: **EchoSense**, **Assembly Guide**, **FlowPilot**, **Vision Loop**, **TraceRoom** e **WattWise**.

## Executar

Sem build nem dependências npm. Serve `dist/` com qualquer servidor estático, por exemplo:

```sh
python3 -m http.server 8000 --directory dist
```

Abre `http://localhost:8000`. Os módulos ES exigem HTTP; abrir `index.html` diretamente como `file://` não é suportado. Também é possível copiar os ficheiros de `dist/` para uma pasta de GitHub Pages, preservando os caminhos relativos.

## Verificar

```sh
npm test
npm run check
```

Os testes verificam as regras dos cenários, etapas omitidas, duplicados, classificação com revisão e fórmulas de energia. Não substituem testes visuais de navegador.

## O que funciona

- EchoSense: áudio sintetizado com Web Audio, rotação, cenários e forma de onda.
- Assembly Guide: confirmação, omissão e correção das seis etapas.
- FlowPilot: ensaio de pedidos, revisão de cliente, exclusão de duplicados, execução local e recuperação após falha simulada.
- Vision Loop: iluminação, limiar, revisão e incorporação de correções numa versão demonstrativa.
- TraceRoom: três incidentes, cronologia e consulta de confirmação simulada.
- WattWise: cálculo de energia e custo sob pressupostos editáveis.
- Seleção de projetos guardada em localStorage e exportação JSON de planos/cenários.
- Navegação por hash, layout responsivo e controlos acessíveis por teclado.

## Limitações

Dados sintéticos, regras determinísticas, sem backend, modelos treinados, captura de câmara/microfone ou integrações externas. As pontuações são ilustrativas. Não há envio de emails nem atuação em equipamento. O áudio só é reproduzido por ação explícita. Os resultados de energia são cálculos, não medições nem garantias de poupança. Só os favoritos persistem após recarregar; os restantes cenários vivem em memória.

As fontes Google Fonts são opcionais: se indisponíveis, a interface usa fontes do sistema. Nenhum dado introduzido é enviado para servidores. A fonte externa e o alojamento podem receber metadados normais de pedidos HTTP.

## Estrutura

`dist/index.html`: estrutura. `dist/styles.css`: design e responsividade. `dist/models.mjs`: regras puras. `dist/app.mjs`: interface e interações. `tests/models.test.mjs`: testes de cenários.

## Evolução

Substituir os modelos de demonstração por serviços separados, mantendo contratos testáveis. Recolher dados reais com autorização, definir métricas de referência e avaliar em sessões distintas antes de integrar em produção. Os planos de cada projeto estão na aplicação e podem ser exportados.
