# VISPUR
Visual Aids for Identifying and Interpreting Spurious Associations in Data-Driven Decisions


## Paper/System Overview
![teaser](https://github.com/picsolab/VISPUR/assets/19478509/3fec43cb-77be-4223-8b5f-4aba1a2c13a1)

**Abstract**: Big data and machine learning tools have jointly empowered humans in making data-driven decisions. However, many of them capture empirical associations that might be spurious due to confounding factors and subgroup heterogeneity. The famous Simpson's paradox is such a phenomenon where aggregated and subgroup-level associations contradict with each other, causing cognitive confusions and difficulty in making adequate interpretations and decisions. Existing tools provide little insights for humans to locate, reason about, and prevent pitfalls of spurious association in practice. We propose VISPUR, a visual analytic system that provides a causal analysis framework and a human-centric workflow for tackling spurious associations. These include a Confounder Dashboard, which can automatically identify possible confounding factors, and a Subgroup Viewer, which allows for the visualization and comparison of diverse subgroup patterns that likely or potentially result in a misinterpretation of causality. Additionally, we propose a Reasoning Storyboard, which uses a flow-based approach to illustrate paradoxical phenomena, as well as an interactive Decision Diagnosis panel that helps ensure accountable decision-making. Through an expert interview and a controlled user experiment, our qualitative and quantitative results demonstrate that the proposed ``de-paradox'' workflow and the designed visual analytic system are effective in helping human users to identify and understand spurious associations, as well as to make accountable causal decisions.

## Setup
1. Create virtual environment (preferred) and install `python` 3.8.12
  ```shell
    $ pipenv --three (or $ pipenv --python X.X)
    $ pipenv shell
    $ pipenv --python 3.8.12
  ```
2. Install python packages for django

  ```shell
    $ pipenv install
  ```
3. Install javascript packages for react

  ```shell
    $ cd src && npm install
  ```
4. Install, and start Postgres
  - Install: refer to the official website and download the app
  - Start: Open the Postgres app
  - Create a database called `app`

  ```shell
    $ psql  // get into postgres shell
    ID=# create database app; // create a database
  ```
---
After everything is set up, start the server and frontend.
(Whenever you want to start the app later, follow these steps.)
(Make sure to activate the virtual environment with `pipenv shell`)
5. Start the server
  ```shell
    $ python manage.py runserver
  ```
6. Start the frontend

## Cite
