$(document).ready(function() {

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

  function retrieveFavorite() {
    x = 0;
    console.log(x);
    database = firebaseInit();
    database.ref().on("child_added", function(childSnapshot, prevChildKey) {
      console.log(childSnapshot);
      parseFavData(childSnapshot);
    });
  }

  function parseFavData(childSnapshot) {
    x++;
    console.log(x);
    var id = childSnapshot.val().id;
    var title = childSnapshot.val().title;
    var image = childSnapshot.val().image;
    updateFavList(id, title, image, x);
  }

  function updateFavList(id, title, image, count) {
    $("#title" + count).html(title);
    $("#name" + count).html(title);
    $("#thumbnail" + count).attr("src", image);
    $('#recipeID' + count).data('recipeID', id);
    console.log($("#recipeID" + count).data("recipeID"));
  }

  //button listener
  function buttonListener() {
    var bns = document.getElementsByTagName("button");
    for (i = 0; i < bns.length; i++) {
      bns[i].addEventListener("click", function() {
        var btnNum = $(this).attr("id");
        var divIDNum = parseInt(btnNum.slice(3));
        console.log(divIDNum);
        getRecipeID(divIDNum);
      });
    }
  }

  function getRecipeID(divIDNum) {
    var recipeID = $("#recipeID" + divIDNum).data("recipeID");
    console.log(recipeID);
    getRecipe(recipeID, divIDNum);
  }

  function getRecipe(recipeID, divIDNum) {
    var output1 = $.ajax({
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/' + recipeID + '/information?includenutrition=false', // for favorite call
      type: 'GET', // The HTTP Method, can be GET POST PUT DELETE etc
      data: {}, // Additional parameters here
      dataType: 'json',
      success: function(data) {
        console.log(data);
        prepareOutputToPage(data, divIDNum);
      },
      error: function(err) { alert(err); },
      beforeSend: function(xhr) {
        xhr.setRequestHeader("X-Mashape-Authorization", "68pkFBaIhgmshtyVwc28fl3QMHAUp1br54TjsnIIK2Hllb3GID");
      }
    });
  }

  function prepareOutputToPage(data, divIDNum) {
    var serveTime = data.readyInMinutes;
    var servings = data.servings;
    var miscOut = "<ul><h2>Miscelaneous Information</h2><li>Time to Table: " + serveTime + " minutes</li><li>Serves: " + servings + "</li></ul>";
    outputToPage(miscOut, "misc" + divIDNum);
    // some data needs some 'massaging'
    var instructions = data.instructions;
    parseInstructions(instructions, divIDNum);
    var ingredients = data.extendedIngredients; //this is an array
    parseIngredients(ingredients, divIDNum);
  }

  function parseIngredients(ingredients, divIDNum) {
    var imgOutput = "<h2>Ingredients</h2>";
    for (i = 0; i < ingredients.length; i++) {
      var name = ingredients[i].name;
      var amount = Math.round((ingredients[i].amount) * 100) / 100;;
      var unit = ingredients[i].unitLong;
      var imageURL = ingredients[i].image;
      imgOutput = imgOutput + "<span style='display:block;'><img style='height:30px;' class='manImg' src='" + imageURL + "'>" + name + " - " + amount + " " + unit + "</img></span>"
    }
    outputToPage(imgOutput, "ingredientList" + divIDNum);
  }

  function parseInstructions(instructions, divIDNum) {
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
    outputToPage(instOutput, "instructions" + divIDNum);
  }

  function outputToPage(outputData, divID) {
    $("#" + divID).empty();
    $("#" + divID).html(outputData);
  }

  x = 0;
  buttonListener();
  retrieveFavorite();
});