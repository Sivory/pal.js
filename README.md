# 仙剑奇侠传 JS重制版 说明档

## 简介

本项目移植自[SDLPAL](http://sdlpal.codeplex.com/)，在原有C代码的基础上，用javascript重写了游戏的所有逻辑。底层接口的改动主要有：

* 原基于SDL的绘图器被改写为基于HTML5 Canvas的绘图器；

* 原资源系统被改写为基于XmlHttpRequest Level 2的资源读取器；

* 原存档系统被改写为基于localStorage的进度存取器；

* 原RIX音乐播放系统被改写为MP3音频播放系统（将RIX音乐转成MP3格式，全部资源文件的尺寸为此翻了一番，计划在加载资源时让用户选择无声版与有声版）

## 开源许可

本项目遵循 [GNU GPL](http://www.gnu.org/licenses/gpl.html) 开源协议发布。您的权利是可以自由且免费地使用、复制、改写本项目中的所有代码。您的义务是必须保证由此衍生出的项目亦遵循 GNU GPL 协议，并向社会公开项目源码。

## 游戏体验

[http://sivory.github.io/pal.js/](http://sivory.github.io/pal.js/)