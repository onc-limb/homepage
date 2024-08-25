package main

import (
	"back/article/infra"
	"back/awssdk"
	"back/graph"
	"context"
	"flag"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

const defaultPort = "5000"

var migrateCommand = flag.Bool("migrate", false, "Run database migrations")

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	flag.Parse()

	// // postgres用
	// db, err := database.SetupDB(*migrateCommand)
	// if err != nil {
	// 	panic("failed to connect database")
	// }

	sdkcfg, err := awssdk.SetSdkConfig()
	if err != nil {
		panic("failed to connect aws")
	}

	dynamo := sdkcfg.SetupDynamoDB(*migrateCommand)

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.POST, echo.OPTIONS},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	e.GET("/", welcome())

	articleRepository := infra.NewArticleRepository(dynamo)

	gqlHandler := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{ArticleRepository: articleRepository}}))
	gqlHandler.SetErrorPresenter(customeErrorPresenter)
	playgroundHandler := playground.Handler("GraphQL", "/graphql")

	e.GET("/playground", func(c echo.Context) error {
		playgroundHandler.ServeHTTP(c.Response(), c.Request())
		return nil
	})
	e.POST("/graphql", func(c echo.Context) error {
		gqlHandler.ServeHTTP(c.Response(), c.Request())
		return nil
	})

	log.Printf("connect to http://localhost:%s/playground for GraphQL playground", port)
	log.Fatalln(e.Start(":" + port))
}

func welcome() echo.HandlerFunc {
	return func(c echo.Context) error {
		return c.String(http.StatusOK, "Welcome!")
	}
}

func customeErrorPresenter(ctx context.Context, err error) *gqlerror.Error {
	switch err.(type) {
	default:
		return graphql.DefaultErrorPresenter(ctx, err)

	}
}
