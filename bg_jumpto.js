/***********************************************************
* Скрипт принимает значение параметра jumpto из адресной строки,
* ищет его вхождения в тексте страницы и раставляет якори 
* для перехода по ним.
* Для подсветки найденных вхождний используйте класс bg_jumpto.
* Горячие клавиши:
*  - Пробел - переход на следующий якорь
*  - Esc - убрать все якори
************************************************************/
var bg_jumpto_copy_page=""; 	// копия страницы в исходном виде
var bg_jumpto_tag=""; 			// метка (искомая строка)
var bg_jumpto_matchs_i=0;		// порядковый номер вхождения на странице
var bg_jumpto_num_matchs=0;		// количество вхождений на странице

/***********************************************************
* Функция принимает имя параметра и возвращает его значение
************************************************************/
function bg_jumpto_getParameterByName(name) {		
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

/***********************************************************
* Функция ищет текст на странице
************************************************************/
function bg_jumpto_FindOnPage() {					

	var help = "Нажмите Пробел для перехода на следующую,\nEsc - отменить выделение.";
	var textToFind = bg_jumpto_getParameterByName('jumpto');
	if (textToFind == "") return false;
	textToFind = textToFind.trim();					// Удаляем пробелы по краям
	// Сохраняем текст страницы
	bg_jumpto_copy_page = document.body.innerHTML;
	// Сохраняем фразу для поиска как метку
	bg_jumpto_tag=textToFind.replace(/\s/g, "_");	// Заменяем пробелы на подчеркивание в метках
	
	// Сформируем регулярное выражение для поиска
	var re_textToFind = textToFind.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");	// Экранируем спецсимволы
	re_textToFind = re_textToFind.replace(/\s/g, "\s");							// Замещаем пробельные символы на \s	
	re_textToFind = re_textToFind.replace(/\.(\d*):/,"\.(<b>)?$1(<\\/b>)?:");	// Только для azbyka.ru: Разрешаем теги <b>...</b> зачем-то обворачивающие номера глав Библии
	re_textToFind = new RegExp(re_textToFind, 'gi');							// Формируем регулярное выражение
	
	// Поиск по регулярному выражению
	var matchs = bg_jumpto_copy_page.match(re_textToFind);
	if(!matchs) return false;
	bg_jumpto_num_matchs = matchs.length;
	
	//Обворачиваем найденный текст в span с якорем (id)
	var i=0;
	document.body.innerHTML = document.body.innerHTML.replace(re_textToFind, function () {
		return	"<span id="+bg_jumpto_tag+"_"+i+" class='bg_jumpto' title='"+help+"'>"+matchs[i++]+"</span>";
	});
	bg_jumpto_next();
	return true;
} 

/***********************************************************
* Функция смещает указатель на следующий якорь
************************************************************/
function bg_jumpto_next() {

	if (bg_jumpto_matchs_i >= bg_jumpto_num_matchs) bg_jumpto_matchs_i=0;
	var path = window.location+"";
	path = path.split('#')[0];
	window.location = path+'#'+bg_jumpto_tag+"_"+bg_jumpto_matchs_i;
	bg_jumpto_matchs_i++;
}

/***********************************************************
* Запускаем процесс после загрузки страницы
************************************************************/
jQuery( document ).ready(function() {
	if (bg_jumpto_FindOnPage()) {
		jQuery(document).keyup(function(e){
			if( e.which == 32 ) bg_jumpto_next();	// Пробел - следующий якорь
			if( e.which == 27 ) {					// Esc - убрать все якори
				document.body.innerHTML = bg_jumpto_copy_page;	
			}
		});
	}
});