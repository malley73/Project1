$(document).ready(function() {
  function emptyDivs() {
    $("#title").empty();
    $("#instructions").empty();
    $("#ingredients").empty();
    $("#img").empty();
    $("#misc").empty();
  }

  // project1.js
  console.log("this loaded");

  function firebaseInit() {
    var config = {
      apiKey: "AIzaSyD3J6w3EM4cTgZC88Wf9HWQvO1sjTNLGwQ",
      authDomain: "project1-fav-meals.firebaseapp.com",
      databaseURL: "https://project1-fav-meals.firebaseio.com",
      projectId: "project1-fav-meals",
      storageBucket: "",
      messagingSenderId: "809946328601"
    };
    firebase.initializeApp(config);

    var database = firebase.database();
    return database;
  }


  function saveToFavorites() {
    savid = localStorage.getItem("id");
    savtitle = localStorage.getItem("title");
    savimage = localStorage.getItem("image");
    console.log(savid + " " + savtitle + " " + savimage);
    database = firebaseInit();
    console.log(database);
    var favorite = {
      id: savid,
      title: savtitle,
      image: savimage
    };
    database.ref().push(favorite);
  }

  function collectNavData() {
    console.log("begin collectNavData");
    var exclusionArray = [];
    var mealDietArray = [];
    var childCheckBoxes = $("ul.check ul li input[type='checkbox']");
    var childRadioSelect = $("ul.check ul li input[type='radio']");
    var id;
    console.log(childCheckBoxes);
    for (i = 0; i < childCheckBoxes.length; i++) {
      id = childCheckBoxes[i].id;
      console.log(document.getElementById(id).checked);
      if (document.getElementById(id).checked === true) {
        exclusionArray.push(childCheckBoxes[i].id);
      }
    }
    for (i = 0; i < childRadioSelect.length; i++) {
      id = childRadioSelect[i].id;
      console.log(document.getElementById(id).checked);
      if (document.getElementById(id).checked === true) {
        mealDietArray.push(childRadioSelect[i].id);
      }
    }
    console.log(exclusionArray);
    console.log(mealDietArray);
    uncheckAll();
    parseDataforAPI(exclusionArray, mealDietArray);
    //var text = $('#menu_selected').text();
  }

  function uncheckAll() {
    var childCheckBoxes = $("ul.check ul li input[type='checkbox']");
    var childRadioSelect = $("ul.check ul li input[type='radio']");
    var id;
    console.log(childCheckBoxes);
    for (i = 0; i < childCheckBoxes.length; i++) {
      id = childCheckBoxes[i].id;
      document.getElementById(id).checked = false;
    }
    for (i = 0; i < childRadioSelect.length; i++) {
      id = childRadioSelect[i].id;
      document.getElementById(id).checked = false;
    }
    document.getElementById("lunch").checked = true;
  }

  function parseDataforAPI(exclusions, mealDiet) {
    var meal = mealDiet[0];
    var mealId = 0;
    switch (meal) {
      case "dinner":
        mealId++;
      case "lunch":
        mealId++;
    }
    var diet = mealDiet[1];
    var exclusionList = exclusions[0];
    for (i = 1; i < exclusions.length; i++) {
      exclusionList = exclusionList + "%2C" + exclusions[i];
    }
    if (diet === undefined) { diet = ""; }
    if (exclusionList === undefined) { exclusionList = ""; }
    console.log(mealId + " " + diet + " " + exclusionList);
    getMeals(mealId, diet, exclusionList);
  }


  function getMeals(meal, diet, exclusions) { // meal Time = breakfast[0],  lunch[1], or dinner[2]
    var output0 = $.ajax({
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/mealplans/generate?diet=' + diet + '&exclude=' +
        exclusions + '&targetCalories=2000&timeFrame=day', //meal plan
      type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
      data: {}, // Additional parameters here
      dataType: 'json',
      success: function(data) {
        console.log(data);
        var recipeID = String(data.meals[meal].id); //array selection from Nav
        getRecipe(recipeID);
      },
      error: function(err) { alert(err); },
      beforeSend: function(xhr) {
        xhr.setRequestHeader("X-Mashape-Authorization", "68pkFBaIhgmshtyVwc28fl3QMHAUp1br54TjsnIIK2Hllb3GID"); // Enter here your Mashape key
      }
    });
  }

  function getRecipe(recipeID) {
    var output1 = $.ajax({
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/' + recipeID + '/information?includenutrition=false', // for favorite call
      type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
      data: {}, // Additional parameters here
      dataType: 'json',
      success: function(data) {
        console.log(data);
        prepareOutputToPage(data);
      },
      error: function(err) { alert(err); },
      beforeSend: function(xhr) {
        xhr.setRequestHeader("X-Mashape-Authorization", "68pkFBaIhgmshtyVwc28fl3QMHAUp1br54TjsnIIK2Hllb3GID");
      }
    });
  }

  function prepareOutputToPage(data) {
    var title = data.title;
    var image = data.image;
    var serveTime = data.readyInMinutes;
    var servings = data.servings;
    var id = data.id;
    //local storage for favorites
    localStorage.setItem("id", id);
    localStorage.setItem("title", title);
    localStorage.setItem("image", image);
    //output strings
    var miscOut = "<ul><h2>Miscelaneous Information</h2><li>Time to Table: " + serveTime + " minutes</li><li>Serves: " + servings + "</li></ul>";
    var titleOut = "<h3>" + title + "</h3>";
    var imageMain = "<img class='recipeImg' height='250' width='auto' src='" + image + "'><br><br>";
    // push to page
    outputToPage(titleOut, "title");
    outputToPage(imageMain, "img");
    outputToPage(miscOut, "misc");
    enableSaveToFavoritesButton();
    // some data needs some 'massaging'
    var instructions = data.instructions;
    parseInstructions(instructions);
    var ingredients = data.extendedIngredients; //this is an array
    parseIngredients(ingredients);
  }

  function parseIngredients(ingredients) {
    var imgOutput = "<h2>Ingredients</h2>";
    for (i = 0; i < ingredients.length; i++) {
      var name = ingredients[i].name;
      var amount = Math.round((ingredients[i].amount) * 100) / 100;;
      var unit = ingredients[i].unitLong;
      var imageURL = ingredients[i].image;
      imgOutput = imgOutput + "<span style='display:block;'><img style='height:30px;' class='manImg' src='" + imageURL + "'>" + name + " - " + amount + " " + unit + "</img></span>"
    }
    outputToPage(imgOutput, "ingredientList");
  }

  function parseInstructions(instructions) {
    console.log(instructions);
    var instOutput = "";
    if (instructions != null) {
      if (instructions.indexOf("<ol>") === -1) { //if not already an ordered list
        instructions = "<ol><h4>Directions</h4><li style='display: list-item;'> " + instructions + "</li></ol>"; //add begin and end tags
        var instList = instructions.split(" ");
        if (instList[1].indexOf("Directions") !== -1) {
          instList[1] = ""; // Remove "Directions" text
        }
        for (i = 0; i < instList.length; i++) {
          instList[i] = String(instList[i]);
          instList[i - 1] = String(instList[i - 1]);
          // remove number from directions "x)"
          if (instList[i].indexOf(")") !== -1 && isNaN(instList[i].charAt(instList[i].indexOf(")") - 1)) === false) {
            instList[i] = instList[i].slice(0, instList[i].indexOf(")") - 1) + instList[i].slice(instList[i].indexOf(")") + 1);
          }
          //insert <li> elements between any period and capital letter
          if (i !== 0) {
            if (instList[i - 1].charAt(instList[i - 1].length - 1) == "." && instList[i].charAt(0) == String(instList[i].charAt(0)).toUpperCase() && instList[i].charAt(0) !== "(") {
              instList[i] = "</li><li style='display: list-item;'>" + instList[i];
            }
          }
          instOutput = instOutput + String(instList[i] + " ");
        }
      } else {
        instOutput = instructions;
      }
    } else {
      instOutput = "<p>Instructions not available</p>";
    }
    instOutput = instOutput + "<p>Note: Recipes are pulled from a user maintained database. This site is not responsible for grammatical errors or inconsistencies.</p>"
    console.log(instOutput);
    outputToPage(instOutput, "instructions");
  }

  function outputToPage(outputData, divID) {
    $("#" + divID).empty();
    $("#" + divID).html(outputData);
  }

  function firebaseInit() {
    var config = {
      apiKey: "AIzaSyD3J6w3EM4cTgZC88Wf9HWQvO1sjTNLGwQ",
      authDomain: "project1-fav-meals.firebaseapp.com",
      databaseURL: "https://project1-fav-meals.firebaseio.com",
      projectId: "project1-fav-meals",
      storageBucket: "",
      messagingSenderId: "809946328601"
    };
    firebase.initializeApp(config);

    var database = firebase.database();
    return database;
  }

  function saveToFavorites() {
    var database = firebaseInit();
    savid = localStorage.getItem("id");
    savtitle = localStorage.getItem("title");
    savimage = localStorage.getItem("image");
    console.log(savid + " " + savtitle + " " + savimage);
    console.log(database);
    var favorite = {
      id: savid,
      title: savtitle,
      image: savimage
    };
    database.ref().push(favorite);
  }

  function enableSaveToFavoritesButton() {
    var button = document.createElement('button');
    button.innerHTML = 'Save To Favorites';
    button.className = 'button';
    button.onclick = function() {
      saveToFavorites();
    }
    document.getElementById('img').append(button);
  }


  // form submit
  $(".submit").on('click', function(event) {
    event.preventDefault();
    collectNavData();
  });





  emptyDivs();
});